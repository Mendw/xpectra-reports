//const createPhantomPool = require('phantom-pool')
//const async = require('asyncawait/async');
//const await = require('asyncawait/await');
const fs = require('fs');
const ejs = require('ejs');
/*
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
*/

fs.readFile('./data.json', 'utf-8', (err, data) => {
    if (err)
        throw err;

    rows  = JSON.parse(data)
    columns = Object.keys(rows[0])
    html = ejs.renderFile('./html/template.ejs', {
        rows:rows,
        columns:columns
    }).then(html=>console.log(html))
})

/*
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
    await(page.render('./docs/report.pdf'))
}))

pool.drain().then(() => pool.clear())*/