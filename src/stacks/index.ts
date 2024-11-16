import { join } from "path";
import { aws_dynamodb, aws_lambda, CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import { NappConfig, ConfigType, SampleConfig, TableV2WithCustomKeySchema } from "../constructs/index.ts";

const sampleConfig: SampleConfig = {
    sample: true,
};

export class SampleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const table = new TableV2WithCustomKeySchema(this, "SampleTable", {
            billing: aws_dynamodb.Billing.onDemand(),
            customKeySchema: {
                partitionKey: { name: "PK", type: aws_dynamodb.AttributeType.STRING },
                sortKey: { name: "SK", type: aws_dynamodb.AttributeType.STRING },
            },
            dynamoStream: aws_dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            encryption: aws_dynamodb.TableEncryptionV2.awsManagedKey(),
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const n = new NappConfig(this, "SampleConfig", {
            config: sampleConfig,
            configType: ConfigType.SampleConfig,
            identifier: "SAMPLE",
            table: table,
        });

        const f = new NodejsFunction(this, "SampleFunction", {
            applicationLogLevelV2: aws_lambda.ApplicationLogLevel.INFO,
            architecture: aws_lambda.Architecture.ARM_64,
            entry: join(import.meta.dirname, "../handlers/sample.ts"),
            environment: {
                [n.configType]: JSON.stringify(n.configItem),
            },
            loggingFormat: aws_lambda.LoggingFormat.JSON,
            systemLogLevelV2: aws_lambda.SystemLogLevel.INFO,
        });

        table.grantReadData(f);

        const fUrl = new aws_lambda.FunctionUrl(this, "SampleFunctionUrl", {
            function: f,
            authType: aws_lambda.FunctionUrlAuthType.NONE,
        });

        new CfnOutput(this, "SampleFunctionUrl ", { value: fUrl.url });
    }
}
