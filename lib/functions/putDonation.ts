import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { apiResponse, ddbDocumentClient } from './shared';
import { Donation } from './models';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const { DATA_TABLE } = process.env;

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const pk = event.pathParameters?.pk;
    if (!pk) {
      return apiResponse({ message: 'pk path parameter is required' }, 400);
    }
    if (!event.body) {
      return apiResponse({ message: 'body is required' }, 400);
    }

    const details = JSON.parse(event.body) as Donation;

    await ddbDocumentClient.send(
      new PutCommand({
        TableName: DATA_TABLE,
        Item: { ...details, pk, sk: 'details' },
      })
    );

    return apiResponse(details);
  } catch (err) {
    console.error(err);

    return apiResponse({ message: (err as any).message }, 500);
  }
}
