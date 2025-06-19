import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../utils/s3Client';
import fs from 'fs';

interface UploadObjectParams {
  bucketName: string;
  key: string;
  filePath?: string;
  content?: string;
  contentType?: string;
}

interface UploadObjectResponse {
  success: boolean;
  bucketName?: string;
  key?: string;
  etag?: string;
  error?: string;
}

export const uploadObjectTool = {
  name: 'upload_object',
  description: 'Uploads a file or content to an S3 bucket',
  parameters: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'Name of the bucket to upload to'
      },
      key: {
        type: 'string',
        description: 'Object key (path) in the bucket'
      },
      filePath: {
        type: 'string',
        description: 'Local file path to upload (mutually exclusive with content)'
      },
      content: {
        type: 'string',
        description: 'String content to upload (mutually exclusive with filePath)'
      },
      contentType: {
        type: 'string',
        description: 'MIME type of the content (e.g., "text/plain", "application/json")'
      }
    },
    required: ['bucketName', 'key']
  },
  handler: async (params: UploadObjectParams): Promise<UploadObjectResponse> => {
    try {
      const s3Client = getS3Client();
      const { bucketName, key, filePath, content, contentType } = params;
      
      // Validate that either filePath or content is provided, but not both
      if ((filePath && content) || (!filePath && !content)) {
        return {
          success: false,
          error: 'Either filePath OR content must be provided, but not both'
        };
      }
      
      let body: Buffer | string;
      
      if (filePath) {
        // Read file from disk
        body = fs.readFileSync(filePath);
      } else {
        // Use provided content
        body = content as string;
      }
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType
      });
      
      const response = await s3Client.send(command);
      
      return {
        success: true,
        bucketName,
        key,
        etag: response.ETag
      };
    } catch (error: any) {
      console.error('Error uploading object:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload object'
      };
    }
  }
};