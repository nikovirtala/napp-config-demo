import { AwsCdkTypeScriptAppProject } from "@nikovirtala/projen-constructs";

const project = new AwsCdkTypeScriptAppProject({
    cdkVersion: "2.201.0",
    copyrightOwner: "Niko Virtala",
    defaultReleaseBranch: "main",
    deps: ["@aws-sdk/client-dynamodb", "@aws-sdk/util-dynamodb", "@types/aws-lambda"],
    devDeps: ["@nikovirtala/projen-constructs"],
    license: "MIT",
    name: "napp-config-demo",
});

project.synth();
