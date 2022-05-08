"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: "us-west-2" });
function createTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const results = client.send(new client_dynamodb_1.CreateTableCommand({
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
        }));
        console.log(results);
    });
}
function deleteTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield client.send(new client_dynamodb_1.DeleteTableCommand({ TableName: 'e_commerce' }));
        console.log(results);
    });
}
function getTables() {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield client.send(new client_dynamodb_1.ListTablesCommand({}));
        console.log(results);
    });
}
function seedTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield client.send(new client_dynamodb_1.BatchWriteItemCommand({
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
                        CreatedAt: '2020-01-03 01:57:44',
                        Status: 'SHIPPED',
                        Amount: '67.43',
                        NumberItems: '7',
                        GSI1PK: 'ORDER#VrgX',
                        GSI1SK: 'ORDER#VrgX',
                    },
                    {
                        PK: 'CUSTOMER#alexdebrie',
                        SK: 'ORDER#1VwV',
                        OrderId: '1VwV',
                        CreatedAt: '2020-01-04 18:53:24',
                        Status: 'CANCELLED',
                        Amount: '12.43',
                        NumberItems: '2',
                        GSI1PK: 'ORDER#1VwV',
                        GSI1SK: 'ORDER#1VwV',
                    },
                    {
                        PK: 'ORDER#VrgX#ITEM#48d7',
                        SK: 'ORDER#VrgX#ITEM#48d7',
                        OrderId: '88da49e72b80',
                        ItemId: '48d7',
                        Description: 'Go, Dog, Go!',
                        Price: '9.72',
                        GSI1PK: 'ORDER#VrgX',
                        GSI1SK: 'ITEM#48d7',
                    },
                    {
                        PK: 'ORDER#VrgX#ITEM#be43',
                        SK: 'ORDER#VrgX#ITEM#be43',
                        OrderId: '88da49e72b80',
                        ItemId: 'be43',
                        Description: 'Les Miserables',
                        Price: '14.64',
                        GSI1PK: 'ORDER#VrgX',
                        GSI1SK: 'ITEM#be43',
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
                        CreatedAt: '2020-03-03 02:57:51',
                        Status: 'SHIPPED',
                        Amount: '97.43',
                        NumberItems: '4',
                        GSI1PK: 'ORDER#1W1h',
                        GSI1SK: 'ORDER#1W1h',
                    },
                ].map(item => ({
                    PutRequest: {
                        Item: (0, util_dynamodb_1.marshall)(item)
                    }
                }))
            },
        }));
        return results;
    });
}
function getOrdersByCustomer(name) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield client.send(new client_dynamodb_1.QueryCommand({
            TableName: 'e_commerce',
            KeyConditionExpression: '#pk = :pk',
            ExpressionAttributeNames: { '#pk': 'PK' },
            ExpressionAttributeValues: { ':pk': { 'S': `CUSTOMER#${name}` } },
        }));
        return (_a = result === null || result === void 0 ? void 0 : result.Items) === null || _a === void 0 ? void 0 : _a.map(item => (0, util_dynamodb_1.unmarshall)(item));
    });
}
function getItemsByOrder(orderId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield client.send(new client_dynamodb_1.QueryCommand({
            TableName: 'e_commerce',
            IndexName: 'GSI1',
            KeyConditionExpression: '#gsi1pk = :order',
            ExpressionAttributeNames: { '#gsi1pk': 'GSI1PK' },
            ExpressionAttributeValues: { ':order': { 'S': `ORDER#${orderId}` } },
        }));
        return (_a = result === null || result === void 0 ? void 0 : result.Items) === null || _a === void 0 ? void 0 : _a.map(item => (0, util_dynamodb_1.unmarshall)(item));
    });
}
function reseedTable() {
    return __awaiter(this, void 0, void 0, function* () {
        yield deleteTable();
        yield createTable();
        yield seedTable();
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        seedTable().then(console.log);
        // Promise.all([
        //     getOrdersByCustomer('alexdebrie'), 
        //     getItemsByOrder('VrgX')]
        // ).then(console.log)
    });
}
main();
