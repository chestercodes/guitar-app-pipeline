import { prodEnvironment } from "./consts";

const getEnv = (name: string) => {
    let v = process.env[name]
    if (!v || v === "") {
        throw new Error(`Need to define ${name}`);
    }

    return v
}

const getPipelineEnv = () => {
    return getEnv("PIPELINE_ENV").toLowerCase()
}

export const getIsProd = () => {
    return getPipelineEnv() === prodEnvironment
}

export const getPipelineGitRef = () => {
    return getEnv("PIPELINE_GIT_REF")
}

export const getRepoOrg = () => {
    return getEnv("REPO_ORG")
}

export const getRepoName = () => {
    return getEnv("REPO_NAME")
}

export const getFunctionName = () => {
    return getEnv("AWS_LAMBDA_FUNCTION_NAME")
}
