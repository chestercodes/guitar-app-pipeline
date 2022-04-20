#!/usr/bin/env zx
import { writeFileSync } from 'fs'
import { exitWithError, getEnvOrFail, appEnv, colour, manifestS3Path, deployedConfigS3Path } from './Shared.mjs'

const triggerFunctionName = getEnvOrFail("TRIGGER_FUNCTION_NAME")
const payloadFileName = "payload.json"
const outputFileName = "output.json"
const payload = {
    type: "deployed",
    appEnv,
    colour,
    manifestS3Path,
    deployedConfigS3Path
}
const json = JSON.stringify(payload, null, 2)
console.log(json)
try {
    writeFileSync(payloadFileName, json)
} catch (error) {
    exitWithError("Write file failed")
}

try {
    await $`aws lambda invoke --function-name ${triggerFunctionName} --cli-binary-format raw-in-base64-out --payload file://${payloadFileName} ${outputFileName}`
    await $`cat ${outputFileName}`
} catch (error) {
    exitWithError("Invoke failed")
}
