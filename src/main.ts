import { App } from "aws-cdk-lib";
import { SampleStack } from "./stacks/index.ts";

const app = new App();

new SampleStack(app, "napp-config-demo");

app.synth();
