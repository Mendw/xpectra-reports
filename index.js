const createPhantomPool = require('phantom-pool')
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var fs = require('fs');

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

html = fs.readFileSync('./html/source.html', 'utf-8')

pool.use(async((phantom) => {
  const page = await(phantom.createPage())
  page.property('paperSize', {
    format: 'Letter',
    header: {
      height: "2cm",
      contents: phantom.callback(function(pageNum, numPages) {
        return "<h6>Header <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
      })
    },
    footer: {
      height: "2cm",
      contents: phantom.callback(function(pageNum, numPages) {
        return "<h6>Footer <span style='float:right'>" + pageNum + " / " + numPages + "</span></h1>";
      })
    }
  })
  await(page.property('content', html))
  await(page.render('./docs/report.pdf'))
}))

pool.drain().then(() => pool.clear())