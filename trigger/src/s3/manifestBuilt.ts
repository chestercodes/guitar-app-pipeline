import { manifestsKey, stageEnvironment } from "../consts"
import { S3ObjectEvent } from "./handler"
import { runDeploy } from "../deploy"

export const keyIsBuiltManifest = (key: string) => {
    return key.startsWith(`${manifestsKey}/`) && key.endsWith(".json")
}

const getAutoDeployEnvironment = (key: string) => {
    if (key.startsWith(`${manifestsKey}/main/`)) {
        return stageEnvironment
    }
    return null
}


export const handleManifestBuilt = async (object: S3ObjectEvent) => {
    console.log("Handle manifest")

    const appEnv = getAutoDeployEnvironment(object.object.key)
    if (!appEnv) {
        console.log("Manifests file is on non auto deployed branch. Take no action.")
        return
    }

    await runDeploy(object.object.key, object.bucket.name, appEnv)
}