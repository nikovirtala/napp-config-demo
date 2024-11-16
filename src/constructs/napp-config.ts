import { createHash } from "crypto";
import { GetItemInput } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { custom_resources } from "aws-cdk-lib";
import { Construct } from "constructs";

import { ITableV2WithCustomKeySchema } from "./table-with-custom-key-schema.ts";

export enum ConfigType {
    SampleConfig = "SAMPLECONFIG",
}

export interface SampleConfig {
    sample: boolean;
}

export interface ConfigProps<T> {
    config: T;
    identifier: string;
    table: ITableV2WithCustomKeySchema;
    configType: ConfigType;
}

export interface ConfigItem extends Pick<GetItemInput, "Key" | "TableName"> {}

export class NappConfig<T> extends Construct {
    public readonly configItem: ConfigItem;
    public readonly configType: ConfigType;

    constructor(scope: Construct, id: string, props: ConfigProps<T>) {
        const { config, identifier, table, configType } = props;

        super(scope, id);

        const { configItem, physicalResourceId } = this.constructConfigItemAndPhysicalResourceId(
            table,
            identifier,
            configType,
        );

        new custom_resources.AwsCustomResource(this, "Config", {
            onCreate: this.createConfig(configItem, physicalResourceId, config),
            onUpdate: this.updateConfig(configItem, physicalResourceId, config),
            onDelete: this.deleteConfig(configItem, physicalResourceId),
            policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({ resources: [table.tableArn] }),
        });

        this.configItem = configItem;
        this.configType = configType;
    }

    private calculateFingerprint = (config: T): string => {
        return createHash("sha256").update(JSON.stringify(config)).digest("hex");
    };

    private constructConfigItemAndPhysicalResourceId = (
        table: ITableV2WithCustomKeySchema,
        identifier: string,
        configType: ConfigType,
    ) => {
        const { partitionKey, sortKey } = table.customKeySchema;

        const partitionKeyValue = `CONFIG#${identifier}`;
        const sortKeyValue = `TYPE#${configType}`;

        const key = marshall({
            [partitionKey.name]: `${partitionKeyValue}${sortKey ? "" : `#${sortKeyValue}`}`,
            ...(sortKey && { [sortKey.name]: sortKeyValue }),
        });

        const physicalResourceIdComponents = [
            table.tableName,
            partitionKey.name,
            partitionKeyValue,
            ...(sortKey ? [sortKey.name, sortKeyValue] : []),
        ];

        const physicalResourceId = physicalResourceIdComponents.join("-").replace(/#/g, "-");

        const configItem: ConfigItem = {
            Key: key,
            TableName: table.tableName,
        };

        return { configItem, physicalResourceId };
    };

    private createConfig = (configItem: ConfigItem, physicalResourceId: string, config: T) => {
        return {
            service: "DynamoDB",
            action: "putItem",
            parameters: {
                Item: {
                    ...configItem.Key,
                    ...marshall({
                        config: config,
                        metadata: {
                            fingerprint: this.calculateFingerprint(config),
                        },
                    }),
                },
                TableName: configItem.TableName,
            },
            physicalResourceId: custom_resources.PhysicalResourceId.of(physicalResourceId),
        };
    };

    private updateConfig = (configItem: ConfigItem, physicalResourceId: string, config: T) => {
        const fingerprint = this.calculateFingerprint(config);

        return {
            service: "DynamoDB",
            action: "updateItem",
            parameters: {
                ...configItem,
                ConditionExpression:
                    "attribute_not_exists(#metadata.#fingerprint) OR #metadata.#fingerprint <> :fingerprint",
                ExpressionAttributeNames: {
                    "#config": "config",
                    "#fingerprint": "fingerprint",
                    "#metadata": "metadata",
                },
                ExpressionAttributeValues: marshall({
                    ":config": config,
                    ":fingerprint": fingerprint,
                }),
                UpdateExpression: "SET #config = :config, #metadata.#fingerprint = :fingerprint",
            },
            physicalResourceId: custom_resources.PhysicalResourceId.of(physicalResourceId),
        };
    };

    private deleteConfig = (configItem: ConfigItem, physicalResourceId: string) => {
        return {
            service: "DynamoDB",
            action: "deleteItem",
            parameters: configItem,
            physicalResourceId: custom_resources.PhysicalResourceId.of(physicalResourceId),
        };
    };
}
