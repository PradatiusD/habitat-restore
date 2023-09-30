import { APIGatewayProxyResult } from 'aws-lambda';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { apiResponse, ddbDocumentClient } from './shared';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Donation } from './models';

const s3client = new S3Client({});

const { IMAGES_BUCKET, DATA_TABLE } = process.env;

export async function handler(): Promise<APIGatewayProxyResult> {
  try {
    const pk = uuidv4();
    const fileName = `${pk}.jpg`;
    const item: Donation = {
      pk,
      sk: 'details',
      status: 'upload-pending',
      url: `https://${IMAGES_BUCKET}.s3.amazonaws.com/${fileName}`,
    };

    await ddbDocumentClient.send(
      new PutCommand({ TableName: DATA_TABLE, Item: item })
    );

    const command = new PutObjectCommand({
      Bucket: IMAGES_BUCKET,
      Key: fileName,
      ContentType: 'image/jpeg',
    });
    const presignedUrl = await getSignedUrl(s3client, command, {
      expiresIn: 3600,
    });
    return apiResponse({ pk, presignedUrl, status: item.status });
  } catch (err) {
    console.error(err);

    return apiResponse({ message: (err as any).message }, 500);
  }
}
