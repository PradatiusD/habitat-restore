import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { AnyPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  Runtime,
  Architecture,
  HttpMethod,
  IFunction,
  Function,
} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import { resolve } from 'path';

/**
 * Python lambda developed separately from CDK stack
 */
const imageProcessingLambdaArn =
  'arn:aws:lambda:us-east-1:286792073781:function:habitat-restore-image-processing';

export class HabitatStack extends Stack {
  api: RestApi;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const prefix = 'habitat-restore';

    const appBucketName = `${prefix}-frontend`;
    const imageBucketName = `${prefix}-images`;

    const dataTable = new Table(this, 'DataTable', {
      tableName: prefix,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    dataTable.addGlobalSecondaryIndex({
      indexName: 'by-status',
      partitionKey: {
        name: 'status',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      projectionType: ProjectionType.ALL,
    });

    const imageBucket = new Bucket(this, 'ImageBucket', {
      bucketName: imageBucketName,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          // For presigned URL access
          allowedOrigins: [
            // In production, this URL will be known
            '*',
          ],
          allowedMethods: [HttpMethods.PUT],
          allowedHeaders: ['*'],
        },
      ],
    });
    // Images are public on purpose
    imageBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        principals: [new AnyPrincipal()],
        resources: [imageBucket.arnForObjects('*')],
      })
    );

    const appBucket = new Bucket(this, 'AppBucket', {
      bucketName: appBucketName,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
      {
        comment: 'Access identity between CloudFront and S3 bucket',
      }
    );

    const distribution = new Distribution(this, 'AppDistribution', {
      defaultBehavior: {
        origin: new S3Origin(appBucket, {
          originAccessIdentity,
        }),
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
      ],
    });

    this.api = new RestApi(this, 'Api', {
      restApiName: prefix,

      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS, // this is also the default
      },
    });

    const postDonation = new NodejsFunction(this, 'PostDonation', {
      functionName: `${prefix}-post-donation`,
      entry: resolve(__dirname, './functions/postDonation.ts'),
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      logRetention: RetentionDays.ONE_MONTH,
      timeout: Duration.seconds(15),
      environment: {
        LOGGING_LEVEL: 'info',
        IMAGES_BUCKET: imageBucket.bucketName,
        DATA_TABLE: dataTable.tableName,
      },
    });
    dataTable.grantReadWriteData(postDonation);
    imageBucket.grantWrite(postDonation);
    this.addApiPath(postDonation, 'donations', HttpMethod.POST);

    const publish = new NodejsFunction(this, 'PutDonation', {
      functionName: `${prefix}-put-donation`,
      entry: resolve(__dirname, './functions/putDonation.ts'),
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      logRetention: RetentionDays.ONE_MONTH,
      timeout: Duration.seconds(15),
      environment: {
        LOGGING_LEVEL: 'info',
        DATA_TABLE: dataTable.tableName,
      },
    });
    dataTable.grantReadWriteData(publish);
    this.addApiPath(publish, 'donations/{pk}', HttpMethod.PUT);

    const getDonation = new NodejsFunction(this, 'GetDonation', {
      functionName: `${prefix}-get-donation`,
      entry: resolve(__dirname, './functions/getDonation.ts'),
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      logRetention: RetentionDays.ONE_MONTH,
      timeout: Duration.seconds(15),
      environment: {
        LOGGING_LEVEL: 'info',
        DATA_TABLE: dataTable.tableName,
      },
    });
    dataTable.grantReadData(getDonation);
    this.addApiPath(getDonation, 'donations/{pk}', HttpMethod.GET);

    const listPublished = new NodejsFunction(this, 'ListPublished', {
      functionName: `${prefix}-list-published`,
      entry: resolve(__dirname, './functions/listPublished.ts'),
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      logRetention: RetentionDays.ONE_MONTH,
      timeout: Duration.seconds(15),
      environment: {
        LOGGING_LEVEL: 'info',
        DATA_TABLE: dataTable.tableName,
      },
    });
    dataTable.grantReadData(listPublished);
    this.addApiPath(listPublished, 'published', HttpMethod.GET);

    const imageProcessingLambda = Function.fromFunctionArn(
      this,
      'ImageProcessingLambdaImport',
      imageProcessingLambdaArn
    );

    imageBucket.addObjectCreatedNotification(
      new LambdaDestination(imageProcessingLambda)
    );

    new CfnOutput(this, 'WebURL', {
      value: distribution.distributionDomainName,
    });
    new CfnOutput(this, 'ApiURL', {
      value: this.api.url,
    });
  }

  addApiPath(func: IFunction, path: string, method: HttpMethod) {
    const resource = this.api.root.resourceForPath(path);
    const integration = new LambdaIntegration(func, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    resource.addMethod(method, integration);
  }
}
