import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { apiResponse, ddbDocumentClient } from './shared';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';

const { IMAGES_BUCKET, DATA_TABLE } = process.env;

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const pk = event.pathParameters?.pk;
    if (!pk) {
      return apiResponse({ message: 'pk path parameter is required' }, 400);
    }

    const results = await ddbDocumentClient.send(
      new GetItemCommand({
        TableName: DATA_TABLE,
        Key: { pk, sk: 'results' } as any,
      })
    );

    if (!results.Item) {
      return apiResponse({ pk, status: 'Item not found' });
    }

    return apiResponse(results.Item);
  } catch (err) {
    console.error(err);

    return apiResponse({ message: (err as any).message }, 500);
  }
}
