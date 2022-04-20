import { deploymentsKey, prodEnvironment, stageEnvironment } from "./consts"
import { triggerWorkflow } from "./github"
import { Colour, getDeployedColour } from "./state"
import { getIsProd } from "./env"

export interface DeployPayload {
    appEnv: string
    colour: string
    manifestS3Path: string
    deployedConfigS3Path: string
}

const flipColour = (colour: Colour) => {
    if (colour === "blue") return "green"
    return "blue"
}

const getDeployNumber = () => {
    const now = new Date()
    const iso = now.toISOString()
    const c = (i: number) => iso.charAt(i)
    const pairAt = (i: number) => [i, i + 1].map(c).join("")
    //012345678101234567820123
    //2011-10-05T14:48:00.000Z
    const nowFormatted = [2, 5, 8].map(pairAt).join("") +
        "_" + [11, 14, 17].map(pairAt).join("")
    return nowFormatted
}

const getDeployedConfigS3Path = (manifestKey: string, manifestBucket: string, appEnv: string, colour: string) => {
    const manifestParts = manifestKey.split('/')
    const manifestFileName = manifestParts[manifestParts.length - 1]
    const manifestVersion = manifestFileName.replace(".json", "")
    const deployNumber = getDeployNumber()
    const deployedConfigS3Key = `${deploymentsKey}/${appEnv}/${deployNumber}-${manifestVersion}-${colour}.json`
    const deployedConfigS3Path = `s3://${manifestBucket}/${deployedConfigS3Key}`
    return deployedConfigS3Path
}

const getAppEnv = (appEnvArg: string) => {
    if (appEnvArg !== prodEnvironment) {
        return appEnvArg
    }

    const isProdPipeline = getIsProd()
    if (isProdPipeline) {
        return prodEnvironment
    }

    // don't let non prod pipeline deploy to prod
    return stageEnvironment
}

export const runDeploy = async (manifestKey: string, manifestBucket: string, appEnvArg: string, colourArg?: string) => {
    console.log(`Deploy manifest ${manifestKey}`)

    const appEnv = getAppEnv(appEnvArg)

    const deployedColour = await getDeployedColour(manifestBucket, appEnv)
    const colour = colourArg ?? flipColour(deployedColour)

    const manifestS3Path = `s3://${manifestBucket}/${manifestKey}`
    const deployedConfigS3Path = getDeployedConfigS3Path(manifestKey, manifestBucket, appEnv, colour)

    const payload = {
        appEnv,
        colour,
        manifestS3Path,
        deployedConfigS3Path
    }

    console.log("Starting deploy with payload")
    console.log(payload)
    await triggerWorkflow(payload, manifestBucket)
}
