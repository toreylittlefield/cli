// @ts-check

const { join } = require('path')

const { startFunctionsServer } = require('../../lib/functions/server')
const { acquirePort, getFunctionsDir, getSiteInformation, injectEnvVariables } = require('../../utils')
const { processInputFromFlag } = require('../../utils/functions/inject-custom-context')

const DEFAULT_PORT = 9999

/**
 * The functions:serve command
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command').BaseCommand} command
 */
const functionsServe = async (options, command) => {
  const { api, config, site, siteInfo } = command.netlify

  const functionsDir = getFunctionsDir({ options, config }, join('netlify', 'functions'))

  await injectEnvVariables({ devConfig: { ...config.dev }, env: command.netlify.cachedConfig.env, site })

  const { capabilities, siteUrl, timeouts } = await getSiteInformation({
    offline: options.offline,
    api,
    site,
    siteInfo,
  })

  const functionsPort = await acquirePort({
    configuredPort: options.port || (config.dev && config.dev.functionsPort),
    defaultPort: DEFAULT_PORT,
    errorMessage: 'Could not acquire configured functions port',
  })

  const injectedClientContext = processInputFromFlag(options.clientContext)

  await startFunctionsServer({
    config,
    api,
    settings: { functions: functionsDir, functionsPort, injectedClientContext },
    site,
    siteInfo,
    siteUrl,
    capabilities,
    timeouts,
    functionsPrefix: '/.netlify/functions/',
    buildersPrefix: '/.netlify/builders/',
  })
}

/**
 * Creates the `netlify functions:serve` command
 * @param {import('../base-command').BaseCommand} program
 * @returns
 */
const createFunctionsServeCommand = (program) =>
  program
    .command('functions:serve')
    .alias('function:serve')
    .description('(Beta) Serve functions locally')
    .option('-f, --functions <dir>', 'Specify a functions directory to serve')
    .option('-p, --port <port>', 'Specify a port for the functions server', (value) => Number.parseInt(value))
    .option('-o, --offline', 'disables any features that require network access')
    .option('-c, --clientContext <dir>', 'inject a custom clientContext with identity')
    .addHelpText('after', 'Helpful for debugging functions.')
    .action(functionsServe)

module.exports = { createFunctionsServeCommand }
