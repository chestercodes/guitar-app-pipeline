import { Octokit } from "@octokit/rest"
import { DeployPayload } from "./deploy"
import { getFunctionName, getPipelineGitRef, getRepoName, getRepoOrg } from "./env"
import { getGithubToken } from "./state"

export const triggerWorkflow = async (payload: DeployPayload, bucket: string) => {
    const githubToken = await getGithubToken(bucket)

    const octokit = new Octokit({
        auth: githubToken
    })

    const inputs = {
        APP_ENV: payload.appEnv,
        COLOUR: payload.colour,
        MANIFEST_S3_PATH: payload.manifestS3Path,
        DEPLOYED_CONFIG_S3_PATH: payload.deployedConfigS3Path,
        TRIGGER_FUNCTION_NAME: getFunctionName()
    }

    await octokit.actions.createWorkflowDispatch({
        ref: getPipelineGitRef(),
        owner: getRepoOrg(),
        repo: getRepoName(),
        workflow_id: "deploy.yml",
        inputs,
    })

}
