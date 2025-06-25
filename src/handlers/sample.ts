import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { APIGatewayProxyResult, Handler } from "aws-lambda";
import { type ConfigItem, ConfigType, type SampleConfig } from "../constructs/index.ts";

const ddbclient = new DynamoDBClient();

const getConfig = async <T>(client: DynamoDBClient, configItem: ConfigItem): Promise<T | undefined> => {
    const data = (await client.send(new GetItemCommand(configItem))).Item;

    return data ? (unmarshall(data).config as T) : undefined;
};

export const handler: Handler = async (_event, _identifier): Promise<APIGatewayProxyResult> => {
    try {
        const stringifiedSampleConfigItem = process.env[ConfigType.SampleConfig];

        if (!stringifiedSampleConfigItem) throw new Error(`missing env. variable: ${ConfigType.SampleConfig}`);

        const sampleConfigItem = JSON.parse(stringifiedSampleConfigItem) as ConfigItem;

        const config = await getConfig<SampleConfig>(ddbclient, sampleConfigItem);

        return config
            ? {
                  body: JSON.stringify({ config: config }),
                  statusCode: 200,
              }
            : {
                  statusCode: 404,
                  body: JSON.stringify({ message: "config not found" }),
              };
    } catch (e) {
        if (e instanceof Error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "internal server error", error: e.message }),
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "internal server error", error: "unknown error" }),
            };
        }
    }
};
