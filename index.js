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
                        PutRequest: {
                            Item: {
                                PK: { S: 'CUSTOMER#alexdebrie' },
                                SK: { S: 'CUSTOMER#alexdebrie' },
                                Username: { S: 'alexdebrie' },
                                EmailAddress: { S: 'alexdebrie1@gmail.com' },
                                Name: { S: 'Alexde Brie' },
                            },
                        }
                    },
                    {
                        PutRequest: {
                            Item: {
                                PK: { S: 'CUSTOMER#alexdebrie' },
                                SK: { S: 'ORDER#VrgX' },
                                OrderId: { S: 'VrgX' },
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
                                PK: { S: 'CUSTOMER#alexdebrie' },
                                SK: { S: 'ORDER#1VwV' },
                                OrderId: { S: '1VwV' },
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
                                PK: { S: 'ORDER#VrgX#ITEM#48d7' },
                                SK: { S: 'ORDER#VrgX#ITEM#48d7' },
                                OrderId: { S: '88da49e72b80' },
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
                                PK: { S: 'ORDER#VrgX#ITEM#be43' },
                                SK: { S: 'ORDER#VrgX#ITEM#be43' },
                                OrderId: { S: '88da49e72b80' },
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
                                PK: { S: 'CUSTOMER#the_don' },
                                SK: { S: 'CUSTOMER#the_don' },
                                Username: { S: 'the_don' },
                                EmailAddress: { S: 'vito@corleone.com' },
                                Name: { S: 'Vito Corleone' },
                            },
                        },
                    },
                    {
                        PutRequest: {
                            Item: {
                                PK: { S: 'CUSTOMER#the_don' },
                                SK: { S: 'ORDER#1W1h' },
                                OrderId: { S: '1W1h' },
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
        }));
        console.log(results);
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
        Promise.all([
            getOrdersByCustomer('alexdebrie'),
            getItemsByOrder('VrgX')
        ]).then(console.log);
    });
}
main();
