import { AwsCdkApp } from "@nikovirtala/projen-aws-cdk-app";
import { javascript } from "projen";

const project = new AwsCdkApp({
    autoApproveOptions: {
        allowedUsernames: ["nikovirtala"],
        secret: "GITHUB_TOKEN",
    },
    cdkVersion: "2.194.0",
    copyrightOwner: "Niko Virtala",
    defaultReleaseBranch: "main",
    deps: ["@aws-sdk/client-dynamodb", "@aws-sdk/util-dynamodb", "@types/aws-lambda"],
    depsUpgradeOptions: {
        workflowOptions: {
            labels: ["auto-approve", "auto-merge"],
        },
    },
    devDeps: ["@nikovirtala/projen-aws-cdk-app"],
    license: "MIT",
    name: "napp-config-demo",
    packageManager: javascript.NodePackageManager.PNPM,
    pnpmVersion: "9",
});

project.synth();
