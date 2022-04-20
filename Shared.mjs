#!/usr/bin/env zx

export const exitWithError = (message, err) => {
    console.log(message)
    if(err){
        console.log(err)
    }
    process.exit(1)
}

export const getEnvOrFail = (name) => {
    const v = process.env[name]
    if(!v){
        exitWithError(`Cannot get env var '${name}'`)
    }
    return v
}

export const deployedConfigS3Path = getEnvOrFail("DEPLOYED_CONFIG_S3_PATH")
export const manifestS3Path = getEnvOrFail("MANIFEST_S3_PATH")
export const colour = getEnvOrFail("COLOUR")
export const appEnv = getEnvOrFail("APP_ENV")

export const pipelineBucket = manifestS3Path.substring("s3://".length).split('/')[0]

export const downloadFile = async (fileKeyOrPath, localFileName) => {
    const s3Path = fileKeyOrPath.startsWith("s3:")
        ? fileKeyOrPath
        : `s3://${pipelineBucket}/${fileKeyOrPath}`
    
    console.log(`Try download file from '${s3Path}' to '${localFileName}'`)
    try {
        await $`aws s3 cp ${s3Path} ${localFileName}  --no-progress `
    } catch (error) {
        exitWithError("Failed to download file", error)
    }
}

export const downloadManifestFile = async fileName => {
    await downloadFile(manifestS3Path, fileName)
}

export const downloadDeployedConfigFile = async fileName => {
    await downloadFile(deployedConfigS3Path, fileName)
}
