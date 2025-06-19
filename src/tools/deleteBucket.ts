import { DeleteBucketCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../utils/s3Client';

interface DeleteBucketParams {
  bucketName: string;
}

interface DeleteBucketResponse {
  success: boolean;
  bucketName?: string;
  error?: string;
}

export const deleteBucketTool = {
  name: 'delete_bucket',
  description: 'Deletes an S3 bucket. The bucket must be empty.',
  parameters: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'Name of the bucket to delete'
      }
    },
    required: ['bucketName']
  },
  handler: async (params: DeleteBucketParams): Promise<DeleteBucketResponse> => {
    try {
      const s3Client = getS3Client();
      const { bucketName } = params;
      
      const command = new DeleteBucketCommand({
        Bucket: bucketName
      });
      
      await s3Client.send(command);
      
      return {
        success: true,
        bucketName
      };
    } catch (error: any) {
      console.error('Error deleting bucket:', error);
      return {
        success: false,
        bucketName: params.bucketName,
        error: error.message || 'Failed to delete bucket'
      };
    }
  }
};