import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UsersAndRoles } from './users-and-roles';

export class BootstrapStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new UsersAndRoles(this, "UsersAndRoles")
  }
}
