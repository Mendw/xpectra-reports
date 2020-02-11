const phantom = require('phantom')
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const fs = require('fs');
const ejs = require('ejs');

let dataDir = './data/'
let filename = 'data'
let files = ['0', '1', '2', '3', '4']
let counter = 0

let ws = fs.createWriteStream('./docs/reportt.html')

var generate_report = async(function () {
    data = fs.readFile('./docs/reportt.html', 'utf-8', (err, data) => {
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
                        page.render('./docs/reportx.pdf').then(() => {
                            console.timeEnd('pdf generation')
                            ph.exit()
                        }
                        )
                    })
                })

            })
        })
    })
})

console.time('html generation')
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