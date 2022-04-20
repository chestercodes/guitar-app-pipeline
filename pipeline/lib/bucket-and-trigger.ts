import { User } from 'aws-cdk-lib/aws-iam';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { getConfig } from './config';
import { pipelineBuildUserName, pipelineDeployUserName } from './users-and-roles';
import { Duration } from 'aws-cdk-lib';

export class BucketAndTrigger extends Construct {
    constructor(parent: Construct, name: string) {
        super(parent, name);

        const config = getConfig()

        const pipelineBucket = new Bucket(this, "PipelineBucket", {
            bucketName: config.pipelineBucketName
        })

        const buildUser = User.fromUserName(this, "PipelineBuildUserRef", pipelineBuildUserName)
        const deployUser = User.fromUserName(this, "PipelineDeployUserRef", pipelineDeployUserName)

        const manifestsPrefix = "manifests"
        pipelineBucket.grantReadWrite(buildUser, "artifacts/*")
        pipelineBucket.grantReadWrite(buildUser, `${manifestsPrefix}/*`)

        pipelineBucket.grantReadWrite(deployUser)

        const triggerFunction = new Function(this, 'TriggerFunction', {
            code: new AssetCode(config.triggerCodeDir),
            handler: 'index.handler',
            runtime: Runtime.NODEJS_14_X,
            environment: {
                PIPELINE_ENV: config.pipelineEnv,
                PIPELINE_BUCKET: config.pipelineBucketName,
                PIPELINE_GIT_REF: config.pipelineGitRef,
                REPO_ORG: config.repoOrg,
                REPO_NAME: config.repoName,
            },
            functionName: config.triggerLambdaName,
            memorySize: 128,
            timeout: Duration.seconds(30)
        });

        pipelineBucket.grantReadWrite(triggerFunction)

        triggerFunction.addEventSource(new S3EventSource(pipelineBucket, {
            events: [EventType.OBJECT_CREATED],
            filters: [{ prefix: `${manifestsPrefix}/` }],
        }));

        const githubToken = config.githubToken
        new BucketDeployment(this, "AddSecret", {
            destinationBucket: pipelineBucket,
            destinationKeyPrefix: "state/",
            prune: false, // don't clear out existing files!!!
            sources: [
                Source.data(config.githubTokenFileName, githubToken)
            ]
        })
    }
}
