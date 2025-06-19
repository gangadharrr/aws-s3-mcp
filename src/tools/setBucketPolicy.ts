import { PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../utils/s3Client';

interface SetBucketPolicyParams {
  bucketName: string;
  policy: string | object;
}

interface SetBucketPolicyResponse {
  success: boolean;
  bucketName?: string;
  error?: string;
}

export const setBucketPolicyTool = {
  name: 'set_bucket_policy',
  description: 'Sets or updates the policy for an S3 bucket',
  parameters: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'Name of the bucket to set the policy for'
      },
      policy: {
        type: ['string', 'object'],
        description: 'The policy document as a JSON string or object'
      }
    },
    required: ['bucketName', 'policy']
  },
  handler: async (params: SetBucketPolicyParams): Promise<SetBucketPolicyResponse> => {
    try {
      const s3Client = getS3Client();
      const { bucketName, policy } = params;
      
      // Convert policy to string if it's an object
      let policyString: string;
      if (typeof policy === 'object') {
        policyString = JSON.stringify(policy);
      } else {
        // Validate that the policy is valid JSON if it's a string
        try {
          JSON.parse(policy);
          policyString = policy;
        } catch (parseError) {
          return {
            success: false,
            bucketName,
            error: 'Invalid policy JSON format'
          };
        }
      }
      
      const command = new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: policyString
      });
      
      await s3Client.send(command);
      
      return {
        success: true,
        bucketName
      };
    } catch (error: any) {
      console.error('Error setting bucket policy:', error);
      return {
        success: false,
        bucketName: params.bucketName,
        error: error.message || 'Failed to set bucket policy'
      };
    }
  }
};