#!/usr/bin/env zx

import { downloadFile, exitWithError, downloadManifestFile } from './Shared.mjs'

const fileName = "./manifest.json"
await downloadManifestFile(fileName)
const manifestContent = await $`cat ${fileName}`
const manifest = JSON.parse(manifestContent)
if (!manifest.deployKey) {
    exitWithError("Manifest file does not contain deployKey node")
}
if (!manifest.artifacts) {
    exitWithError("Manifest file does not contain artifacts node")
}

for (const artifact of manifest.artifacts) {
    const env = artifact.env
    const key = artifact.key
    if (!env) {
        exitWithError("Artifact does not contain env")
    }
    if (!key) {
        exitWithError("Artifact does not contain key")
    }
    console.log(`Setting ${env} to ${key}`)
    process.env[env] = key
}

const deployKey = manifest.deployKey
console.log(`Deploy artifact is: ${deployKey}`)

const deployFileName = "./deploy.zip"
await downloadFile(deployKey, deployFileName)

await $`unzip -qq ${deployFileName} -d deploy`
cd("deploy")

try {
    await $`zx deploy.mjs`
} catch (error) {
    exitWithError("Deploy file failed")
}