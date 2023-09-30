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
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AnyPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  Runtime,
  Architecture,
  HttpMethod,
  IFunction,
} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { resolve } from 'path';

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

    const imageBucket = new Bucket(this, 'ImageBucket', {
      bucketName: imageBucketName,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: RemovalPolicy.DESTROY,
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

    const postImage = new NodejsFunction(this, 'Images', {
      entry: resolve(__dirname, './functions/postImage.ts'),
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
    dataTable.grantReadWriteData(postImage);
    imageBucket.grantWrite(postImage);
    this.addApiPath(postImage, 'images', HttpMethod.POST);

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
