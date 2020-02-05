const createPhantomPool = require('phantom-pool')
var async = require('asyncawait/async');
var await = require('asyncawait/await');

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

pool.use(async((ph_instance) => {
  const page = await(ph_instance.createPage())
  await(page.property('viewportSize', {
    format: 'A5',
    orientation: 'portrait',
  }))
  await(page.property('content', '<h1>HELLO, WORLD</h1>'))
  await(page.render('./docs/hw.pdf'))
}))

pool.drain().then(() => pool.clear())
