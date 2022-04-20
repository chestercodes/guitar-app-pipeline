import { stageEnvironment } from "../consts"
import { runDeploy } from "../deploy"
import { getIsProd } from "../env"

export type Deployed = {
    type: "deployed"
    colour: string
    appEnv: string
    manifestS3Path: string
    deployedConfigS3Path: string
}

export type ManuallyDeploy = {
    type: "deploy"
    colour: string
    appEnv: string
    manifestS3Path: string
}

export type InvokeTrigger = Deployed | ManuallyDeploy

export const isInvokeTrigger = (e: any) => {
    return !!e.type
}

const s3PathToBucket = (s3Path: string) => {
    return s3Path.substring("s3://".length).split('/')[0]
}

const s3PathToKey = (s3Path: string) => {
    const bucket = s3PathToBucket(s3Path)
    const start = "s3://" + bucket + "/"
    return s3Path.substring(start.length)
}

const handleDeployed = async (e: Deployed) => {
    console.log("Handle deployed")
    const deployWasStagingEnv = e.appEnv === stageEnvironment
    const manifestIsFromMainBranch = e.manifestS3Path.lastIndexOf("/manifests/main/") !== -1
    const isProdPipeline = getIsProd()

    if (!deployWasStagingEnv) {
        console.log("Deploy is not staging env")
        return
    }

    if (!manifestIsFromMainBranch) {
        console.log("Manifest is not main branch")
        return
    }

    if (!isProdPipeline) {
        console.log("Not in production trigger function")
        return
    }

    console.log("Promote to prod")
    const bucket = s3PathToBucket(e.manifestS3Path)
    const key = s3PathToKey(e.manifestS3Path)
    await runDeploy(key, bucket, "prod")
}

const handleManuallyDeploy = async (e: ManuallyDeploy) => {
    console.log("Deploy manually")
    console.log(e)

    if (e.appEnv === "prod") {
        console.log("Want to deploy to prod")
        const isProdPipeline = getIsProd()
        if (!isProdPipeline) {
            console.log("Not in production trigger function")
            return
        }
    }

    console.log(`Deploy to ${e.appEnv}`)
    const bucket = s3PathToBucket(e.manifestS3Path)
    const key = s3PathToKey(e.manifestS3Path)
    await runDeploy(key, bucket, e.appEnv, e.colour)
}

export const handle = async (e: InvokeTrigger) => {
    console.log("Handle invoke trigger")

    if (e.type === "deployed") {
        await handleDeployed(e)
        return
    }

    if (e.type === "deploy") {
        await handleManuallyDeploy(e)
        return
    }

    console.log("Could not handle invoke trigger")
}