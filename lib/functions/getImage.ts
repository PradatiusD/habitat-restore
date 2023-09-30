import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { apiResponse, ddbDocumentClient } from './shared';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';

const { DATA_TABLE } = process.env;

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const pk = event.pathParameters?.pk;
    if (!pk) {
      return apiResponse({ message: 'pk path parameter is required' }, 400);
    }

    console.log('pk is', pk);

    const details = await ddbDocumentClient.get({
      TableName: DATA_TABLE,
      Key: { pk, sk: 'details' },
    });
    if (!details.Item) {
      return apiResponse({ message: 'record does not exist' }, 404);
    }

    const results = await ddbDocumentClient.get({
      TableName: DATA_TABLE,
      Key: { pk, sk: 'results' },
    });

    if (!results.Item) {
      return apiResponse({ pk, status: 'results-not-ready' });
    }

    return apiResponse({ status: 'ready', ...results.Item });
  } catch (err) {
    console.error(err);

    return apiResponse({ message: (err as any).message }, 500);
  }
}
