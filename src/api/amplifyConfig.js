import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from '../aws-exports.js';

// Check if Amplify is properly configured (aws-exports has real config)
const isConfigured = awsExports && typeof awsExports === 'object' && awsExports.aws_project_region;

if (isConfigured) {
  Amplify.configure(awsExports);
}

export const client = isConfigured ? generateClient() : null;
export const isAmplifyConfigured = isConfigured;
