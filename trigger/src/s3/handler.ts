import { handleManifestBuilt, keyIsBuiltManifest } from "./manifestBuilt"

export interface S3BucketInfo {
    name: string
    arn: string
}

export interface S3ObjectInfo {
    key: string
    size: number
    eTag: string
    sequencer: string
}

export interface S3ObjectEvent {
    bucket: S3BucketInfo
    object: S3ObjectInfo
}

export interface LambdaEvent {
    s3: S3ObjectEvent
}

export interface Event {
    Records: LambdaEvent[]
}

export const isS3Trigger = (e: any) => {
    const containsRecords = !!e.Records
    return containsRecords
}

export const handle = async (e: Event) => {
    console.log("Handle S3 event")

    for (const record of e.Records) {
        const key = record.s3.object.key
        console.log(`Received S3 event for key ${key}`)

        if (keyIsBuiltManifest(key)) {
            await handleManifestBuilt(record.s3)
            continue
        }


    }
}