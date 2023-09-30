import { App } from 'aws-cdk-lib';
import { HabitatStack } from '../lib/HabitatStack';

const app = new App();

new HabitatStack(app, 'HabitatStack', {
  stackName: 'habitat-restore',
  env: {
    account: '286792073781',
    region: 'us-east-1',
  },
});
