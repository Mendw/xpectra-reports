const createPhantomPool = require('phantom-pool')
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const fs = require('fs');
const ejs = require('ejs');
const merge = require('easy-pdf-merge');

let exp = /.+\.pdf$/
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

function merge_pdfs(pathArray, output) {
    merge(pathArray, output, (err) => {
        if (err)
            return console.log(err)

        console.timeEnd('merge took')
        console.timeEnd('total')
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
                    await(page.render(`./docs/report_${file}.pdf`))
                }))
                    .then(() => {
                        console.log('#' + file + ' done')
                        if (++counter == files.length) {
                            pool.drain().then(() => pool.clear())
                            console.timeEnd('initial generation took')
                            console.time('merge took')
                            merge_pdfs(fs.readdirSync(docDir).filter(dirent => exp.test(dirent)).map(dirent => docDir + '/' + dirent), docDir + '/' + 'report.pdf')
                        }
                    })

            })
    })
})