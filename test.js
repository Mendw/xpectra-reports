const phantom = require('phantom')
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const fs = require('fs');
const ejs = require('ejs');
const os = require('os-utils')

var initialMemoryUsage = 100 - os.freememPercentage() * 100
var initialCPU = 0

os.cpuUsage((v) => {
    initialCPU = v;
    main();
})

let dataDir = './data/'
let filename = 'data'
let files = ['0', '1', '2', '3', '4']
let counter = 0
let flag = false

let ws = fs.createWriteStream('./docs/temp.html')

function main() {
    var profiling = setInterval(() => {
        if (!flag) {
            console.log('\tCPU\tMEM');
            flag = true
        }
        os.cpuUsage(function (v) {
            console.log(`\t${((v - initialCPU) * 100).toFixed(2) + ''}\t${(((1 - os.freememPercentage()) * 100) - initialMemoryUsage).toFixed(2)}`)
        })
    }, 500)

    var generate_report = async(function () {
        data = fs.readFile('./docs/temp.html', 'utf-8', (err, data) => {
            if (err)
                return console.error(err)
            phantom.create().then(ph => {
                ph.createPage().then(page => {
                    page.property('paperSize', {
                        format: 'Letter',
                        header: {
                            height: "2cm",
                            contents: ph.callback(function (pageNum, numPages) {
                                return "<h6>Header <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
                            })
                        },
                        footer: {
                            height: "2cm",
                            contents: ph.callback(function (pageNum, numPages) {
                                return "<h6>Footer <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
                            })
                        }
                    }).then(() => {
                        page.property('content', data).then(() => {
                            page.render('./docs/report_v2.pdf').then(() => {
                                clearInterval(profiling)
                                console.timeEnd('pdf generation')
                                console.timeEnd('total')
                                ph.exit()
                                cleanup()
                            }
                            )
                        })
                    })

                })
            })
        })
    })

    console.time('html generation')
    console.time('total')
    files.forEach(file => {
        fs.readFile(`${dataDir}${filename}_${file}.json`, 'utf-8', (err, data) => {
            if (err)
                throw err;

            rows = JSON.parse(data)
            columns = Object.keys(rows[0])
            ejs.renderFile('./html/template.ejs', {
                rows: rows,
                columns: columns
            })
                .then(html => {
                    ws.write(html, (err) => {
                        if (err)
                            return console.error(err)
                        if (++counter == files.length) {
                            ws.close()
                            console.timeEnd('html generation')
                            console.time('pdf generation')
                            generate_report()
                        }
                    })


                })
        })
    })
}

function cleanup() {
    fs.unlink('./docs/temp.html', () => {
        //
    })
}