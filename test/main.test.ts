import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { beforeAll, describe, expect, test } from "vitest";

describe("SampleStack", () => {
    let template: Template;

    beforeAll(async () => {
        /* Skip bundling: the tests check the resources, not the asset hash of the bundle, which
         * changes with every change to the handler or its dependencies. */
        const app = new App({ context: { "aws:cdk:bundling-stacks": [] } });
        const { SampleStack } = await import("../src/stacks/index.ts");

        template = Template.fromStack(new SampleStack(app, "test"));
    });

    test("creates the config table with the custom key schema", () => {
        template.resourceCountIs("AWS::DynamoDB::GlobalTable", 1);
        template.hasResourceProperties("AWS::DynamoDB::GlobalTable", {
            KeySchema: [
                { AttributeName: "PK", KeyType: "HASH" },
                { AttributeName: "SK", KeyType: "RANGE" },
            ],
            BillingMode: "PAY_PER_REQUEST",
            StreamSpecification: { StreamViewType: "NEW_AND_OLD_IMAGES" },
        });
    });

    test("writes the sample config item with a custom resource", () => {
        const resources = Object.values(template.findResources("Custom::AWS"));
        expect(resources).toHaveLength(1);

        const create = JSON.stringify(resources[0].Properties.Create);
        expect(create).toContain('\\"action\\":\\"putItem\\"');
        expect(create).toContain('\\"PK\\":{\\"S\\":\\"CONFIG#SAMPLE\\"}');
        expect(create).toContain('\\"SK\\":{\\"S\\":\\"TYPE#SAMPLECONFIG\\"}');
    });

    test("passes the config item key to the function", () => {
        template.hasResourceProperties("AWS::Lambda::Function", {
            Architectures: ["arm64"],
            Environment: {
                Variables: {
                    SAMPLECONFIG: Match.anyValue(),
                },
            },
            LoggingConfig: Match.objectLike({ LogFormat: "JSON" }),
        });
    });

    test("exposes the function through a public function URL", () => {
        template.hasResourceProperties("AWS::Lambda::Url", { AuthType: "NONE" });
    });
});
