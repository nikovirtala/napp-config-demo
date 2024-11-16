# NappConfig demo

## What is NappConfig?

NappConfig is a proof of concept miming AWS AppConfig (a feature flag and dynamic configuration service). It helps software builders adjust application behavior without deploying application code.

NappConfig is deployed and updated using the AWS CDK construct, it uses CloudFormation custom resources to create, update and delete the configuration, and stores the configuration data in Amazon DynamoDB.

## Try yourself

The code in this repository is ready to be deployed.

Install dependencies with:

```
yarn install
```

Deploy with:

```
projen deploy
```

Successful deployment gives you a URL, you can open with a browser or cURL:

```
 ✅  napp-config-demo

✨  Deployment time: 24.47s

Outputs:
napp-config-demo.SampleFunctionUrl = https://26jbblnr4pny6swbgtvxp4zc5i0ibzwi.lambda-url.eu-west-1.on.aws/
```

Opening the URL will print you the current config:

```
$ curl -s https://26jbblnr4pny6swbgtvxp4zc5i0ibzwi.lambda-url.eu-west-1.on.aws/ | jq .
{
  "config": {
    "sample": true
  }
}
```

Now change line 9 in `src/stacks/index.ts`, deploy again, and see how the output in the URL changes
