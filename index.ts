import { DynamoDBClient, CreateTableCommand, ListTablesCommand, BatchWriteItemCommand, DeleteTableCommand, QueryCommand } from "@aws-sdk/client-dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb"

const client = new DynamoDBClient({ region: "us-west-2" });

async function createTable() {
    const results = client.send(new CreateTableCommand({ 
        BillingMode: 'PAY_PER_REQUEST',
        TableName: 'e_commerce',
        KeySchema: [             
            {
                AttributeName: 'PK',
                KeyType: 'HASH',
            },
            {
                AttributeName: 'SK',
                KeyType: 'RANGE'
            }
        ],
        AttributeDefinitions: [
            {
                AttributeName: 'PK',
                AttributeType: 'S'
            },
            {
                AttributeName: 'SK',
                AttributeType: 'S'
            }
        ]
    }))
    console.log(results)
}

async function deleteTable() {
    const results = await client.send(new DeleteTableCommand({ TableName: 'e_commerce' }))
    console.log(results)
}

async function getTables() {
    const results = await client.send(new ListTablesCommand({}))
    console.log(results)
}

async function seedTable() {
    const results = await client.send(new BatchWriteItemCommand({
        RequestItems: {
            e_commerce: [
                // Alex Debrie
                {
                    PutRequest: {
                        Item: {
                            PK: { S: 'CUSTOMER#alexdebrie'},
                            SK: { S: 'CUSTOMER#alexdebrie'},
                            Username: { S: 'alexdebrie'},
                            EmailAddress: { S: 'alexdebrie1@gmail.com'},
                            Name: { S: 'Alexde Brie'},
                        },
                    }
                },
                {
                    PutRequest: {
                        Item: {
                            PK: { S: 'CUSTOMER#alexdebrie'},
                            SK: { S: 'ORDER#VrgX'},
                            OrderId: { S: 'VrgX'},
                            CreatedAt: { S: '2020-01-03 01:57:44' },
                            Status: { S: 'SHIPPED' },
                            Amount: { S: '67.43' },
                            NumberItems: { S: '7' },
                            GSI1PK: { S: 'ORDER#VrgX' },
                            GSI1SK: { S: 'ORDER#VrgX' },
                        },
                    },
                },
                {
                    PutRequest: {
                        Item: {
                            PK: { S: 'CUSTOMER#alexdebrie'},
                            SK: { S: 'ORDER#1VwV'},
                            OrderId: { S: '1VwV'},
                            CreatedAt: { S: '2020-01-04 18:53:24' },
                            Status: { S: 'CANCELLED' },
                            Amount: { S: '12.43' },
                            NumberItems: { S: '2' },
                            GSI1PK: { S: 'ORDER#1VwV' },
                            GSI1SK: { S: 'ORDER#1VwV' },
                        },
                    },
                },
                {
                    PutRequest: {
                        Item: {
                            PK: { S: 'ORDER#VrgX#ITEM#48d7'},
                            SK: { S: 'ORDER#VrgX#ITEM#48d7'},
                            OrderId: { S: '88da49e72b80'},
                            ItemId: { S: '48d7' },
                            Description: { S: 'Go, Dog, Go!' },
                            Price: { S: '9.72' },
                            GSI1PK: { S: 'ORDER#VrgX' },
                            GSI1SK: { S: 'ITEM#48d7' },
                        },
                    },
                },
                {
                    PutRequest: {
                        Item: {
                            PK: { S: 'ORDER#VrgX#ITEM#be43'},
                            SK: { S: 'ORDER#VrgX#ITEM#be43'},
                            OrderId: { S: '88da49e72b80'},
                            ItemId: { S: 'be43' },
                            Description: { S: 'Les Miserables' },
                            Price: { S: '14.64' },
                            GSI1PK: { S: 'ORDER#VrgX' },
                            GSI1SK: { S: 'ITEM#be43' },
                        },
                    },
                },
                // Vito Corleone
                {
                    PutRequest: {
                        Item: {
                            PK: { S: 'CUSTOMER#the_don'},
                            SK: { S: 'CUSTOMER#the_don'},
                            Username: { S: 'the_don'},
                            EmailAddress: { S: 'vito@corleone.com'},
                            Name: { S: 'Vito Corleone'},
                        },
                    },
                },
                {
                    PutRequest: {
                        Item: {
                            PK: { S: 'CUSTOMER#the_don'},
                            SK: { S: 'ORDER#1W1h'},
                            OrderId: { S: '1W1h'},
                            CreatedAt: { S: '2020-03-03 02:57:51' },
                            Status: { S: 'SHIPPED' },
                            Amount: { S: '97.43' },
                            NumberItems: { S: '4' },
                            GSI1PK: { S: 'ORDER#1W1h' },
                            GSI1SK: { S: 'ORDER#1W1h' },
                        },
                    },
                },
            ],
        },
    }))

    console.log(results)
}
async function getOrdersByCustomer(name: String) {
    const result = await client.send(new QueryCommand({
        TableName: 'e_commerce',
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: { '#pk': 'PK' },
        ExpressionAttributeValues: { ':pk': { 'S': `CUSTOMER#${name}` } },
    }))

    return result?.Items?.map(item => unmarshall(item))
}

async function getItemsByOrder(orderId: String) {
    const result = await client.send(new QueryCommand({
        TableName: 'e_commerce',
        IndexName: 'GSI1',
        KeyConditionExpression: '#gsi1pk = :order',
        ExpressionAttributeNames: { '#gsi1pk': 'GSI1PK' },
        ExpressionAttributeValues: { ':order': { 'S': `ORDER#${orderId}` } },
    }))

    return result?.Items?.map(item => unmarshall(item))
}

async function reseedTable() {
    await deleteTable()
    await createTable()
    await seedTable()
}

async function main() {
    Promise.all([
        getOrdersByCustomer('alexdebrie'), 
        getItemsByOrder('VrgX')]
    ).then(console.log)
}

main()
