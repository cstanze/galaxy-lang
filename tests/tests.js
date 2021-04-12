const fs = require('fs')
const config = require('./config')
const exit = process.exit
const argv = process.argv

if(argv.length > 3 || argv.length < 3) {
  console.log("You must specify a galaxy test to run.")
  exit()
}

const testGalaxies = fs.readdirSync('./tests/galaxies').map(gl => gl.split('.')[0])
if(!testGalaxies.includes(argv[2])) {
  console.log("Galaxy does not exist")
  exit()
}

try {
  const test = require(`./index.js`)
  const start = Date.now()
  test.run(argv[2], process.env.DEBUG)
  const elapsed = Date.now() - start

  console.log(`Test Galaxy ${argv[2]} passed.`)
  if(config.bench)
    console.log(`Bench results: ${elapsed}ms`)
} catch(e) {
  if(process.env.DEBUG)
    console.log(e)
  console.log(`Test Galaxy ${argv[2]} failed.`)
}
