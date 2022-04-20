#!/usr/bin/env zx

import { exitWithError, downloadFile, downloadManifestFile } from './Shared.mjs'

const fileName = "./manifest.json"
await downloadManifestFile(fileName)

const manifestContent = await $`cat ${fileName}`
const manifest = JSON.parse(manifestContent)
if (!manifest.testKey) {
    console.log("Manifest file does not contain testKey node")
    process.exit(0)
}

const testKey = manifest.testKey
const testsFileName = "./test.zip"
await downloadFile(testKey, testsFileName)

await $`unzip -qq ${testsFileName} -d test`
cd('test')
await $`ls .`

try {
    await $`zx test.mjs`
} catch (error) {
    exitWithError("Test file failed")
}