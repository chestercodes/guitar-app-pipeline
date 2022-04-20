import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketAndTrigger } from './bucket-and-trigger';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new BucketAndTrigger(this, "BucketAndTrigger")
  }
}
