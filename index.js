const os = require('os-utils')

var initialMemoryUsage = 100 - os.freememPercentage() * 100
os.cpuUsage((v) => {
    initialCPU = v;
    main();
})

function main() {
    const createPhantomPool = require('phantom-pool')
    const async = require('asyncawait/async');
    const await = require('asyncawait/await');
    const fs = require('fs');
    const ejs = require('ejs');
    const merge = require('easy-pdf-merge');

    let exp = /temp_.+\.pdf$/
    let docDir = './docs'

    const pool = createPhantomPool({
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000,
        maxUses: 50,
        validator: (resource) => Promise.resolve(true),
        testOnBorrow: true,
        phantomArgs: [['--ignore-ssl-errors=true', '--disk-cache=true'],
            //{logLevel: 'debug',}
        ],
    })
    let dataDir = './data/'
    let filename = 'data'
    let files = ['0', '1', '2', '3', '4']
    let counter = 0
    flag = false

    var profiling = setInterval(() => {
        if (!flag) {
            console.log('\tCPU\tMEM');
            flag = true
        }
        os.cpuUsage(function (v) {
            console.log(`\t${((v - initialCPU) * 100).toFixed(2) + ''}\t${(((1 - os.freememPercentage()) * 100) - initialMemoryUsage).toFixed(2)}`)
        })
    }, 500)

    function cleanup(){
        files.forEach(file => {
            fs.unlink(`./docs/temp_${file}.pdf`, () => {
                //
            })
        })
    }

    function merge_pdfs(pathArray, output) {
        merge(pathArray, output, (err) => {
            if (err)
                return console.log(err)
            clearInterval(profiling)
            console.timeEnd('merge took')
            console.timeEnd('total')
            cleanup()
        })
    }
    console.time('total')
    console.time('initial generation took')
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
                    pool.use(async((phantom) => {
                        const page = await(phantom.createPage())
                        page.property('paperSize', {
                            format: 'Letter',
                            header: {
                                height: "2cm",
                                contents: phantom.callback(function (pageNum, numPages) {
                                    return "<h6>Header <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
                                })
                            },
                            footer: {
                                height: "2cm",
                                contents: phantom.callback(function (pageNum, numPages) {
                                    return "<h6>Footer <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
                                })
                            }
                        })
                        await(page.property('content', html))
                        await(page.render(`./docs/temp_${file}.pdf`))
                    }))
                        .then(() => {
                            if (++counter == files.length) {
                                pool.drain().then(() => pool.clear())
                                console.timeEnd('initial generation took')
                                console.time('merge took')
                                merge_pdfs(fs.readdirSync(docDir).filter(dirent => exp.test(dirent)).map(dirent => docDir + '/' + dirent), docDir + '/' + 'report_v1.pdf')
                            }
                        })

                })
        })
    })
}