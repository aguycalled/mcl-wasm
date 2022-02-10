const crypto = require('crypto')
const mclCreateModule = typeof WebAssembly === "object" ? require('./mcl_c.js') : require('./mcl_c_nowasm.js')
const mclSetupFactory = require('./mcl')

const getRandomValues = crypto.randomFillSync
const mcl = mclSetupFactory(mclCreateModule, getRandomValues)

module.exports = mcl
