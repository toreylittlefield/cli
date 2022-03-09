// @ts-check
const fs = require('fs')
const path = require('path')
const process = require('process')

// https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
const tryParseJSON = function (jsonString) {
  try {
    const parsedValue = JSON.parse(jsonString)

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (parsedValue && typeof parsedValue === 'object') {
      return parsedValue
    }
  } catch {}

  return false
}

/** process payloads from flag */
const processInputFromFlag = function (clientContextString) {
  if (!clientContextString) return
  if (clientContextString) {
    // case 1: jsonstring
    let clientContext = tryParseJSON(clientContextString)
    if (clientContext) return clientContext
    // case 2: jsonpath
    const clientContextPath = path.join(process.cwd(), clientContextString)
    const pathexists = fs.existsSync(clientContextPath)
    if (pathexists) {
      try {
        // there is code execution potential here
        // eslint-disable-next-line node/global-require, import/no-dynamic-require
        clientContext = require(clientContextPath)
        return clientContext
      } catch (error_) {
        console.error(error_)
      }
    }
    // case 3: invalid string, invalid path
    return false
  }
}

module.exports = { processInputFromFlag }
