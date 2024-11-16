import { aws_dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface TableKey {
    name: string;
    type: aws_dynamodb.AttributeType;
}

export interface CustomKeySchema {
    partitionKey: TableKey;
    sortKey?: TableKey;
}

export interface TableV2WithCustomKeySchemaProps extends Omit<aws_dynamodb.TablePropsV2, "partitionKey" | "sortKey"> {
    customKeySchema: CustomKeySchema;
}

export interface ITableV2WithCustomKeySchema extends aws_dynamodb.ITableV2 {
    customKeySchema: CustomKeySchema;
}

export class TableV2WithCustomKeySchema extends aws_dynamodb.TableV2 implements ITableV2WithCustomKeySchema {
    public readonly customKeySchema: CustomKeySchema;

    constructor(scope: Construct, id: string, props: TableV2WithCustomKeySchemaProps) {
        const { customKeySchema, ...tablePropsV2 } = props;

        super(scope, id, {
            ...tablePropsV2,
            partitionKey: customKeySchema.partitionKey,
            sortKey: customKeySchema.sortKey ? customKeySchema.sortKey : undefined,
        });

        this.customKeySchema = customKeySchema;
    }
}
