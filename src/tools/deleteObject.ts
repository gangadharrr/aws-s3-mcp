import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../utils/s3Client';

interface DeleteObjectParams {
  bucketName: string;
  key: string;
}

interface DeleteObjectResponse {
  success: boolean;
  bucketName?: string;
  key?: string;
  error?: string;
}

export const deleteObjectTool = {
  name: 'delete_object',
  description: 'Deletes an object from an S3 bucket',
  parameters: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'Name of the bucket containing the object'
      },
      key: {
        type: 'string',
        description: 'Object key (path) to delete'
      }
    },
    required: ['bucketName', 'key']
  },
  handler: async (params: DeleteObjectParams): Promise<DeleteObjectResponse> => {
    try {
      const s3Client = getS3Client();
      const { bucketName, key } = params;
      
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      
      await s3Client.send(command);
      
      return {
        success: true,
        bucketName,
        key
      };
    } catch (error: any) {
      console.error('Error deleting object:', error);
      return {
        success: false,
        bucketName: params.bucketName,
        key: params.key,
        error: error.message || 'Failed to delete object'
      };
    }
  }
};