import { S3Client } from '@aws-sdk/client-s3';

// Initialize the S3 client with credentials from environment variables or AWS config
const s3Client = new S3Client({
  // If specific credentials are provided as environment variables, use them
  // Otherwise, the SDK will look for credentials in the shared credentials file (~/.aws/credentials)
  // or from the EC2 instance metadata service if running on an EC2 instance
  region: process.env.AWS_REGION || 'us-east-1',
});

// Export a function to get the S3 client
export function getS3Client(): S3Client {
  return s3Client;
}