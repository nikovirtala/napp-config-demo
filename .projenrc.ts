import { AwsCdkTypeScriptAppProject } from "@nikovirtala/projen-constructs";

const project = new AwsCdkTypeScriptAppProject({
    autoApproveOptions: {
        allowedUsernames: ["nikovirtala"],
        secret: "GITHUB_TOKEN",
    },
    cdkVersion: "2.201.0",
    copyrightOwner: "Niko Virtala",
    defaultReleaseBranch: "main",
    deps: ["@aws-sdk/client-dynamodb", "@aws-sdk/util-dynamodb", "@types/aws-lambda"],
    depsUpgradeOptions: {
        workflowOptions: {
            labels: ["auto-approve", "auto-merge"],
        },
    },
    devDeps: ["@nikovirtala/projen-constructs"],
    license: "MIT",
    name: "napp-config-demo",
});

project.synth();
