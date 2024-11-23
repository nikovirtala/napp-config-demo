import { AwsCdkApp } from "@nikovirtala/projen-aws-cdk-app";
const project = new AwsCdkApp({
    cdkVersion: "2.170.0",
    copyrightOwner: "Niko Virtala",
    defaultReleaseBranch: "main",
    deps: ["@aws-sdk/client-dynamodb", "@aws-sdk/util-dynamodb", "@types/aws-lambda"],
    devDeps: ["@nikovirtala/projen-aws-cdk-app"],
    license: "MIT",
    name: "napp-config-demo",
});

project.synth();
