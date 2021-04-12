const { GalaxyTokenizer } = require('../build/tokenizer')
const fs = require('fs')
const { inspect } = require('util')

module.exports = {
  run(test, debug) {
    let tokenizer = new GalaxyTokenizer(fs.readFileSync(__dirname + `/galaxies/${test}.galaxy`).toString(), debug)
    let tokenMap = tokenizer.tokenMap
    console.log(inspect(tokenMap, false, Infinity, true))
    console.log(tokenizer.tokenStats)
  }
}
