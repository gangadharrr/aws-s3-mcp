import { GetBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../utils/s3Client';

interface GetBucketPolicyParams {
  bucketName: string;
}

interface GetBucketPolicyResponse {
  success: boolean;
  bucketName?: string;
  policy?: any;
  error?: string;
}

export const getBucketPolicyTool = {
  name: 'get_bucket_policy',
  description: 'Retrieves the policy for an S3 bucket',
  parameters: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'Name of the bucket to get the policy for'
      }
    },
    required: ['bucketName']
  },
  handler: async (params: GetBucketPolicyParams): Promise<GetBucketPolicyResponse> => {
    try {
      const s3Client = getS3Client();
      const { bucketName } = params;
      
      const command = new GetBucketPolicyCommand({
        Bucket: bucketName
      });
      
      const response = await s3Client.send(command);
      
      let policy = null;
      if (response.Policy) {
        try {
          policy = JSON.parse(response.Policy);
        } catch (parseError) {
          // If parsing fails, return the raw policy string
          policy = response.Policy;
        }
      }
      
      return {
        success: true,
        bucketName,
        policy
      };
    } catch (error: any) {
      // Check if the error is because there's no policy
      if (error.name === 'NoSuchBucketPolicy') {
        return {
          success: true,
          bucketName: params.bucketName,
          policy: null
        };
      }
      
      console.error('Error getting bucket policy:', error);
      return {
        success: false,
        bucketName: params.bucketName,
        error: error.message || 'Failed to get bucket policy'
      };
    }
  }
};