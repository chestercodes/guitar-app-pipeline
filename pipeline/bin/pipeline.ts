#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { appName, getAppEnv } from '../lib/config';
import { BootstrapStack } from '../lib/bootstrap-stack';

const account = process.env.AWS_ACCOUNT
if(!account){
    throw new Error("Need to specify AWS_ACCOUNT");
}
const region = process.env.AWS_REGION
if(!region){
    throw new Error("Need to specify AWS_REGION");
}

const app = new cdk.App();

new PipelineStack(app, `${appName}-pipeline-${getAppEnv()}`, {
    env: { account, region },
});

new BootstrapStack(app, `${appName}-bootstrap`, {
    env: { account, region },
});