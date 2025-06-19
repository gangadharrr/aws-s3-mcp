import { CreateBucketCommand, BucketLocationConstraint } from '@aws-sdk/client-s3';
import { getS3Client } from '../utils/s3Client';

interface CreateBucketParams {
  bucketName: string;
  region?: string;
}

interface CreateBucketResponse {
  success: boolean;
  bucketName?: string;
  location?: string;
  error?: string;
}

export const createBucketTool = {
  name: 'create_bucket',
  description: 'Creates a new S3 bucket with the specified name',
  parameters: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'Name of the bucket to create. Must be globally unique across all AWS accounts.'
      },
      region: {
        type: 'string',
        description: 'AWS region where the bucket should be created. Defaults to the client\'s configured region.'
      }
    },
    required: ['bucketName']
  },
  handler: async (params: CreateBucketParams): Promise<CreateBucketResponse> => {
    try {
      const s3Client = getS3Client();
      const { bucketName, region } = params;
      
      // Set up the command
      const command = new CreateBucketCommand({
        Bucket: bucketName,
        CreateBucketConfiguration: region ? {
          LocationConstraint: region as BucketLocationConstraint
        } : undefined
      });
      
      const response = await s3Client.send(command);
      
      return {
        success: true,
        bucketName,
        location: response.Location
      };
    } catch (error: any) {
      console.error('Error creating bucket:', error);
      return {
        success: false,
        error: error.message || 'Failed to create bucket'
      };
    }
  }
};