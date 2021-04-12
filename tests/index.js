const { Galaxy } = require('../build/Galaxy')
const fs = require('fs')
const { inspect } = require('util')

module.exports = {
  run(test, debug) {
    let contents = fs.readFileSync(__dirname + `/galaxies/${test}.galaxy`).toString()
    let galaxy = Galaxy.parse(contents, debug)
    
    console.log(inspect(galaxy, false, Infinity, true))
    
    galaxy.stars.push({
      name: "Ron",
      size: "small",
      central: false
    })

    galaxy = Galaxy.stringify(galaxy)

    fs.writeFileSync(__dirname + `/galaxies/${test.replace('_modified', '')}_modified.galaxy`, galaxy)
  }
}
