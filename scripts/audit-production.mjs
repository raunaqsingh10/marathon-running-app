import { spawnSync } from 'node:child_process'

const allowedAdvisory = 'https://github.com/advisories/GHSA-qwww-vcr4-c8h2'
const allowedPackages = new Set(['react-router', 'react-router-dom'])
const result = spawnSync('npm', ['audit', '--omit=dev', '--json'], { encoding: 'utf8' })

if (!result.stdout) {
  console.error(result.stderr || 'npm audit did not return a report')
  process.exit(1)
}

const report = JSON.parse(result.stdout)
const vulnerabilities = Object.entries(report.vulnerabilities ?? {})
const unexpected = vulnerabilities.filter(([name, vulnerability]) => {
  if (!allowedPackages.has(name)) return true
  return vulnerability.via.some((cause) => {
    if (typeof cause === 'string') return !allowedPackages.has(cause)
    return cause.url !== allowedAdvisory
  })
})

if (unexpected.length > 0) {
  console.error(`Unexpected production vulnerabilities: ${unexpected.map(([name]) => name).join(', ')}`)
  process.exit(1)
}

if (vulnerabilities.length > 0) {
  console.log('Production audit passed with the documented React Router RSC-only exception.')
} else {
  console.log('Production audit passed with no known vulnerabilities.')
}
