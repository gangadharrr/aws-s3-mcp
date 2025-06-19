import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getS3Client } from '../utils/s3Client';

interface ListObjectsParams {
  bucketName: string;
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

interface S3Object {
  key: string;
  size: number;
  lastModified: string | null;
  etag?: string;
  storageClass?: string;
}

interface ListObjectsResponse {
  success: boolean;
  objects?: S3Object[];
  count?: number;
  isTruncated?: boolean;
  nextContinuationToken?: string;
  error?: string;
}

export const listObjectsTool = {
  name: 'list_objects',
  description: 'Lists objects in an S3 bucket with optional prefix filtering',
  parameters: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'Name of the bucket to list objects from'
      },
      prefix: {
        type: 'string',
        description: 'Filter objects by prefix (folder path)'
      },
      maxKeys: {
        type: 'number',
        description: 'Maximum number of objects to return (default: 1000, max: 1000)'
      },
      continuationToken: {
        type: 'string',
        description: 'Token to retrieve the next set of results'
      }
    },
    required: ['bucketName']
  },
  handler: async (params: ListObjectsParams): Promise<ListObjectsResponse> => {
    try {
      const s3Client = getS3Client();
      const { bucketName, prefix, maxKeys, continuationToken } = params;
      
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
        ContinuationToken: continuationToken
      });
      
      const response = await s3Client.send(command);
      
      const objects = response.Contents?.map(object => ({
        key: object.Key || '',
        size: object.Size || 0,
        lastModified: object.LastModified ? object.LastModified.toISOString() : null,
        etag: object.ETag,
        storageClass: object.StorageClass
      })) || [];
      
      return {
        success: true,
        objects,
        count: objects.length,
        isTruncated: response.IsTruncated,
        nextContinuationToken: response.NextContinuationToken
      };
    } catch (error: any) {
      console.error('Error listing objects:', error);
      return {
        success: false,
        error: error.message || 'Failed to list objects'
      };
    }
  }
};