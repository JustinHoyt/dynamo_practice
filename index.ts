import { DynamoDBClient, CreateTableCommand, ListTablesCommand, BatchWriteItemCommand, DeleteTableCommand, QueryCommand } from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

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
                    PK: 'CUSTOMER#alexdebrie',
                    SK: 'CUSTOMER#alexdebrie',
                    Username: 'alexdebrie',
                    EmailAddress: 'alexdebrie1@gmail.com',
                    Name: 'Alexde Brie',
                },
                {
                    PK: 'CUSTOMER#alexdebrie',
                    SK: 'ORDER#VrgX',
                    OrderId: 'VrgX',
                    CreatedAt: '2020-01-03 01:57:44' ,
                    Status: 'SHIPPED' ,
                    Amount: '67.43' ,
                    NumberItems: '7' ,
                    GSI1PK: 'ORDER#VrgX' ,
                    GSI1SK: 'ORDER#VrgX' ,
                },
                {
                    PK: 'CUSTOMER#alexdebrie',
                    SK: 'ORDER#1VwV',
                    OrderId: '1VwV',
                    CreatedAt: '2020-01-04 18:53:24' ,
                    Status: 'CANCELLED' ,
                    Amount: '12.43' ,
                    NumberItems: '2' ,
                    GSI1PK: 'ORDER#1VwV' ,
                    GSI1SK: 'ORDER#1VwV' ,
                },
                {
                    PK: 'ORDER#VrgX#ITEM#48d7',
                    SK: 'ORDER#VrgX#ITEM#48d7',
                    OrderId: '88da49e72b80',
                    ItemId: '48d7' ,
                    Description: 'Go, Dog, Go!' ,
                    Price: '9.72' ,
                    GSI1PK: 'ORDER#VrgX' ,
                    GSI1SK: 'ITEM#48d7' ,
                },
                {
                    PK: 'ORDER#VrgX#ITEM#be43',
                    SK: 'ORDER#VrgX#ITEM#be43',
                    OrderId: '88da49e72b80',
                    ItemId: 'be43' ,
                    Description: 'Les Miserables' ,
                    Price: '14.64' ,
                    GSI1PK: 'ORDER#VrgX' ,
                    GSI1SK: 'ITEM#be43' ,
                },
                // Vito Corleone
                {
                    PK: 'CUSTOMER#the_don',
                    SK: 'CUSTOMER#the_don',
                    Username: 'the_don',
                    EmailAddress: 'vito@corleone.com',
                    Name: 'Vito Corleone',
                },
                {
                    PK: 'CUSTOMER#the_don',
                    SK: 'ORDER#1W1h',
                    OrderId: '1W1h',
                    CreatedAt: '2020-03-03 02:57:51' ,
                    Status: 'SHIPPED' ,
                    Amount: '97.43' ,
                    NumberItems: '4' ,
                    GSI1PK: 'ORDER#1W1h' ,
                    GSI1SK: 'ORDER#1W1h' ,
                },
            ].map(item => ({
                PutRequest: { 
                    Item: marshall(item) 
                }
            }))
        },
    }))

    return results
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
    seedTable().then(console.log)
    // Promise.all([
    //     getOrdersByCustomer('alexdebrie'), 
    //     getItemsByOrder('VrgX')]
    // ).then(console.log)
}

main()
