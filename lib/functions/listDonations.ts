import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { apiResponse, ddbDocumentClient } from './shared';
import { Donation } from './models';

const { DATA_TABLE } = process.env;

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const published =
      (
        await ddbDocumentClient.query({
          TableName: DATA_TABLE,
          IndexName: 'by-status',
          KeyConditionExpression: 'status = :status',
          ExpressionAttributeValues: {
            ':sk': 'published',
          },
        })
      ).Items ?? ([] as Donation[]);

    return apiResponse(published);
  } catch (err) {
    console.error(err);

    return apiResponse({ message: (err as any).message }, 500);
  }
}
