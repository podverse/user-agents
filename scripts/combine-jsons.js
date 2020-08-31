const { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = require('fs')
const glob = require('glob').sync
const { join } = require('path')
const YAML = require('json2yaml')
const { version } = require('../package.json');

let finalOutput = []

const combineJSONs = () => {
  const orgs = getOrganizations('src/organizations')

  for (const org of orgs) {
    const userAgents = combineAndSortOrganizationUserAgents(org)
    userAgents.forEach((x) => finalOutput.push(x))
  }

  const distPath = `dist`
  const archiveDirectoryPath = `${distPath}/archive/${version}`

  if (!existsSync(archiveDirectoryPath)) {
    mkdirSync(archiveDirectoryPath);
  }

  const fileName = 'user-agents'
  const archiveFilePath = `${archiveDirectoryPath}/${fileName}`
  const latestFilePath = `${distPath}/${fileName}`

  writeFileSync(`${archiveFilePath}.json`, JSON.stringify(finalOutput, null, 2))
  writeFileSync(`${latestFilePath}.json`, JSON.stringify(finalOutput, null, 2))

  const ymlText = YAML.stringify(finalOutput)
  writeFileSync(`${archiveFilePath}.yaml`, ymlText)
  writeFileSync(`${latestFilePath}.yaml`, ymlText)
}

const combineAndSortOrganizationUserAgents = (organization) => {
  const files = glob(`src/organizations/${organization}/**/*.json`)
  const output = []

  files.forEach((filename) => {
    const contents = JSON.parse(readFileSync(filename, 'utf8'))
    output.push(contents)
  })

  return output.sort((a, b) => a.priority > b.priority)
}

/*
 * Get the name of all directories inside the src/organizations directory.
 * Thanks to Nick McCurdy on StackOverflow for this example.
 * https://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs
 */
const getOrganizations = (source) => {
  const isDirectory = source => lstatSync(source).isDirectory()
  const getDirectories = source =>
    readdirSync(source).map(name => join(source, name)).filter(isDirectory)
  const directoryPaths = getDirectories(source)
  const organizationNames = directoryPaths.map(source => source.replace('src/organizations/', ''))
  return organizationNames
}

combineJSONs()
