import { GetObjectCommandOutput, S3 } from "@aws-sdk/client-s3"
import { Readable } from "stream"
import { stateKey } from "./consts"

export type Colour = "blue" | "green"

const githubTokenPath = `${stateKey}/githubToken.txt`

const asStream = (response: GetObjectCommandOutput) => {
    return response.Body as Readable;
};

const asBuffer = async (response: GetObjectCommandOutput) => {
    const stream = asStream(response);
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};

const asString = async (response: GetObjectCommandOutput) => {
    const buffer = await asBuffer(response);
    return buffer.toString();
};

export const getDeployedColour = async (bucket: string, appEnv: string) => {
    const s3 = new S3({});
    const statePath = `${stateKey}/${appEnv}/deployedColour.txt`
    try {
        const object = await s3.getObject({
            Bucket: bucket,
            Key: statePath
        })

        const content = await asString(object)
        if (content === "blue") {
            return "blue"
        }

        if (content === "green") {
            return "green"
        }

        console.log(`Invalid data in colour file: '${content}'`)
        return "green"

    } catch (error) {
        console.log("Failed to get colour")
        console.log(error)

        return "green"
    }
}

export const getGithubToken = async (bucket: string) => {
    const s3 = new S3({});

    try {
        const object = await s3.getObject({
            Bucket: bucket,
            Key: githubTokenPath
        })

        const content = await asString(object)
        return content
    } catch (error) {
        console.log("Failed to get token")
        console.log(error)
        throw new Error("Failed to get token");
    }
}
