import { ManagedPolicy, User } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { getIsProd, ResourcePrefix } from './config';

export const pipelineBuildUserName = `${ResourcePrefix}-build-user`
export const pipelineDeployUserName = `${ResourcePrefix}-deploy-user`

export class UsersAndRoles extends Construct {
    constructor(parent: Construct, name: string) {
        super(parent, name);

        if (!getIsProd()) {
            return
        }
        console.log("Going to make IAM resources")


        const pipelineBuildUser = new User(this, "PipelineBuildUser", {
            userName: pipelineBuildUserName
        })

        const adminAccess = ManagedPolicy.fromManagedPolicyArn(this, "AdminAccessPolicy", "arn:aws:iam::aws:policy/AdministratorAccess")
        const pipelineDeployUser = new User(this, "PipelineDeployUser", {
            userName: pipelineDeployUserName,
            managedPolicies: [
                adminAccess
            ]
        })

    }
}
