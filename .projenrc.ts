import { AwsCdkApp } from "@nikovirtala/projen-aws-cdk-app";
const project = new AwsCdkApp({
  cdkVersion: "2.167.1",
  copyrightOwner: "Niko Virtala",
  defaultReleaseBranch: "main",
  devDeps: ["@nikovirtala/projen-aws-cdk-app"],
  license: "MIT",
  name: "cdk-dynamodb-crud-custom-resource",
  projenrcTs: true,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
