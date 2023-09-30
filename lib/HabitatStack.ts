import { LswApi } from '@lsw-apps/infrastructure';
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AnyPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Architecture, Code } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class HabitatStack extends Stack {
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
    });

    const api = new LswApi(this, 'Api', {
      restApiName: prefix,
    });

    // const defaults = {
    //   api,
    //   handler: 'index.handler',
    //   runtime: Runtime.NODEJS_18_X,
    //   architecture: Architecture.ARM_64,
    //   logRetention: RetentionDays.ONE_MONTH,
    //   timeout: Duration.seconds(15),
    //   environment: {
    //     LOGGING_LEVEL: 'info',
    //     IMAGES_BUCKET: imageBucket.bucketName,
    //     DATA_TABLE: dataTable.tableName,
    //   },
    // };

    // const code = (entry: string) => Code.fromAsset(`./dist/${entry}`);

    // const report = new LswApiFunction(this, 'Report', {
    //   ...defaults,
    //   code: code('report'),
    //   paths: {
    //     report: [HttpMethod.GET],
    //   },
    //   keepWarm: true,
    //   ddbCrud: [imagesTable.tableName, statsTable.tableName],
    // });

    new CfnOutput(this, 'WebURL', {
      value: distribution.distributionDomainName,
    });
    new CfnOutput(this, 'ApiURL', {
      value: api.url,
    });
  }
}
