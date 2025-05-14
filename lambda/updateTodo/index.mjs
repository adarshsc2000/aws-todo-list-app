import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,PUT",
  };

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const userId = event.requestContext?.authorizer?.claims?.sub;
    const todoId = event.pathParameters?.id;

    if (!userId || !todoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const updatedAt = new Date().toISOString();

    await dynamo.send(
      new UpdateCommand({
        TableName: "Todos",
        Key: { userId, todoId },
        UpdateExpression: "set title = :title, completed = :completed, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":title": body.title,
          ":completed": body.completed,
          ":updatedAt": updatedAt,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Todo updated successfully" }),
    };
  } catch (error) {
    console.error("Lambda error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
