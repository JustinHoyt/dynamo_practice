import { DynamoDBClient, CreateTableCommand, ListTablesCommand, BatchWriteItemCommand, DeleteTableCommand, QueryCommand, PutItemCommand, PutItemCommandOutput } from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

const client = new DynamoDBClient({ region: "us-west-2" });

function upper(obj: any) {
    for (const [key, val] of Object.entries(obj)) {
        if (typeof(val) === 'string') {
            obj[key] = val.toUpperCase()
        }
    }
}

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

const getOrdersByCustomer = async (context: { username: String }) => {
    const result = await client.send(new QueryCommand({
        TableName: 'e_commerce',
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: { '#pk': 'PK' },
        ExpressionAttributeValues: { ':pk': { 'S': `CUSTOMER#${context.username}` } },
    }))

    return result?.Items?.map(item => unmarshall(item))
}

const getAddresses = async (context: { username: String }) => {
    const result = await client.send(new QueryCommand({
        TableName: 'e_commerce',
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: { '#pk': 'PK' },
        ExpressionAttributeValues: { ':pk': { 'S': `CUSTOMER#${context.username}` } },
    }))

    const customer = unmarshall(result?.Items?.[0] ?? {})
    return customer.Addresses ?? {}
}

const getItemsByOrder = async (context: { orderId: String }) => {
    const result = await client.send(new QueryCommand({
        TableName: 'e_commerce',
        IndexName: 'GSI1',
        KeyConditionExpression: '#gsi1pk = :order',
        ExpressionAttributeNames: { '#gsi1pk': 'GSI1PK' },
        ExpressionAttributeValues: { ':order': { 'S': `ORDER#${context.orderId}` } },
    }))

    return result?.Items?.map(item => unmarshall(item))
}

type PutOrder = (context: {
    username: string,
    orderId: string,
    numberItems: string,
    status: string,
    amount: string,
    createdAt: string,
    type: string,
}) => Promise<PutItemCommandOutput>

const putOrder: PutOrder = async (context) =>
    await client.send(new PutItemCommand({
        TableName: 'e_commerce',
        Item: marshall({
            PK: `CUSTOMER#${context.username}`,
            SK: `ORDER#${context.orderId}`,
            GSI1PK: `ORDER#${context.orderId}`,
            GSI1SK: `ORDER#${context.orderId}`,
            Username: context.username,
            OrderId: context.orderId,
            NumberItems: context.numberItems,
            Status: context.status,
            Amount: context.amount,
            CreatedAt: context.createdAt,
            Type: 'Order',
        })
    }))

type PutCustomer = (context: {
    email: String,
    name: String,
    username: String,
    addresses: Record<string, string>,
}) => Promise<PutItemCommandOutput>

const putCustomer: PutCustomer = async (context) =>
    await client.send(new PutItemCommand({
        TableName: 'e_commerce',
        Item: marshall({
            PK: `CUSTOMER#${context.username}`,
            SK: `CUSTOMER#${context.username}`,
            EmailAddress: context.email,
            Username: context.username,
            Name: context.name,
            Addresses: context.addresses,
        }, {
            removeUndefinedValues: true,
        })
    }))

async function reseedTable() {
    await deleteTable()
    await createTable()
    await seedTable()
}

const commands: Record<string, Function> = {
    GET_ORDERS_BY_CUSTOMER: getOrdersByCustomer,
    GET_ITEMS_BY_ORDER: getItemsByOrder,
    PUT_CUSTOMER: putCustomer,
    PUT_ORDER: putOrder,
    GET_ADDRESSES: getAddresses,
}

export async function handler(event: any) {
    const key = event.requestContext.type
    if (key in commands) {
        return await commands[key](event.requestContext)
    } else {
        throw 'Command type not found'
    }
}

const getOrdersByCustomerObject = {
    "requestContext": {
        "username": "alexdebrie",
        "type": "GET_ORDERS_BY_CUSTOMER",
    }
};

const putCustomerObject = {
    "requestContext": {
        "username": "kalli_forth_account",
        "name": "Kalli Allen",
        "email": "kalli_second_email@yahoo.com",
        "type": "PUT_CUSTOMER",
        "addresses": {
            "Home": "123 1st ave, New York City",
            "Work": "432 Full st, New York City",
        },
    }
};

const putOrderObject = {
    "requestContext": {
        "username": "JustinHoyt",
        "orderId": '112141',
        "numberItems": "4",
        "status": "SHIPPING",
        "amount": "142",
        "createdAt": "2020-03-01 23:20:02",
        "type": "PUT_ORDER",
    }
};

const getAddressesObject = {
    "requestContext": {
        "username": "kalli_forth_account",
        "type": "GET_ADDRESSES",
    }
};

(async () => 
    !process.env.LAMBDA_TASK_ROOT && await handler(getAddressesObject).then(console.log)
)()
