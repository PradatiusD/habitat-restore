import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { apiResponse, ddbDocumentClient } from './shared';
import { Donation, DonationResults } from './models';

const { DATA_TABLE } = process.env;

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const pk = event.pathParameters?.pk;
    if (!pk) {
      return apiResponse({ message: 'pk path parameter is required' }, 400);
    }

    const details = (
      await ddbDocumentClient.get({
        TableName: DATA_TABLE,
        Key: { pk, sk: 'details' },
      })
    ).Item as Donation;

    if (!details) {
      return apiResponse({ message: 'record does not exist' }, 404);
    }

    const results = (
      await ddbDocumentClient.get({
        TableName: DATA_TABLE,
        Key: { pk, sk: 'results' },
      })
    ).Item as DonationResults;

    if (!results) {
      return apiResponse({ pk, status: 'results-not-ready' });
    }

    return apiResponse({ ...results, status: 'ready', url: details.url });
  } catch (err) {
    console.error(err);

    return apiResponse({ message: (err as any).message }, 500);
  }
}
