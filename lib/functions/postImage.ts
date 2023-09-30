import { APIGatewayProxyResult } from 'aws-lambda';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ddbDocumentClient } from './ddbDocumentClient';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const s3client = new S3Client({});

const { IMAGES_BUCKET, DATA_TABLE } = process.env;

export async function handler(): Promise<APIGatewayProxyResult> {
  try {
    const pk = uuidv4();
    const item = { pk, sk: 'details', status: 'upload-pending' };

    await ddbDocumentClient.send(
      new PutCommand({ TableName: DATA_TABLE, Item: item })
    );

    const command = new GetObjectCommand({
      Bucket: IMAGES_BUCKET,
      Key: `${pk}.jpg`,
    });
    const presignedUrl = await getSignedUrl(s3client, command, {
      expiresIn: 3600,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ pk, presignedUrl, status: item.status }),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: (err as any).message }),
    };
  }
}
