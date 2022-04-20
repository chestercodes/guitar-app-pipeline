export const appName = "guitarapp"

export const ResourcePrefix = `${appName}-pipeline`

export const getEnv = (name: string, def: string) => {
    let v = process.env[name]
    if (!v) { return def }
    return v
}

export const getAppEnv = () => {
    let appEnv = getEnv("PIPELINE_ENV", "prod")
    return appEnv.toLowerCase()
}

export const getIsProd = () => {
    const appEnv = getAppEnv()
    return appEnv === "prod"
}

export const getEnvResourcePrefix = () => {
    return `${ResourcePrefix}-${getAppEnv()}`
}

export interface Config {
    isProd: boolean
    pipelineEnv: string
    triggerLambdaName: string
    triggerCodeDir: string
    pipelineBucketName: string
    pipelineGitRef: string
    repoName: string
    repoOrg: string
    githubTokenFileName: string
    githubToken: string
}

export const getConfig = () => {
    const prefix = getIsProd() ? ResourcePrefix : getEnvResourcePrefix()
    const bucketName = `${prefix}`
    const triggerLambdaName = `${prefix}-trigger`

    const pipelineGitRef = getEnv("PIPELINE_GIT_REF", "main")

    const repo = getEnv("REPOSITORY", "chestercodes/guitar-app-pipeline")
    const repoSplit = repo.split('/')
    if (repoSplit.length !== 2) {
        throw new Error(`REPOSITORY is not as expected '${repo}'`);
    }
    const repoOrg = repoSplit[0]
    const repoName = repoSplit[1]

    const config: Config = {
        pipelineEnv: getAppEnv(),
        isProd: getIsProd(),
        pipelineBucketName: bucketName,
        pipelineGitRef,
        triggerCodeDir: "/trigger-dist",
        triggerLambdaName,
        repoOrg,
        repoName,
        githubTokenFileName: "githubToken.txt",
        githubToken: getEnv("PIPELINE_GITHUB_TOKEN", "XXX")
    }

    return config
}