import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../utils/s3Client';

interface ListBucketsResponse {
  success: boolean;
  buckets?: Array<{
    name: string;
    creationDate: string | null;
  }>;
  count?: number;
  error?: string;
}

export const listBucketsTool = {
  name: 'list_buckets',
  description: 'Lists all S3 buckets in the AWS account',
  parameters: {},
  handler: async (): Promise<ListBucketsResponse> => {
    try {
      const s3Client = getS3Client();
      const command = new ListBucketsCommand({});
      const response = await s3Client.send(command);
      
      // Format the response
      const buckets = response.Buckets || [];
      return {
        success: true,
        buckets: buckets.map(bucket => ({
          name: bucket.Name || '',
          creationDate: bucket.CreationDate ? bucket.CreationDate.toISOString() : null
        })),
        count: buckets.length
      };
    } catch (error: any) {
      console.error('Error listing buckets:', error);
      return {
        success: false,
        error: error.message || 'Failed to list buckets'
      };
    }
  }
};