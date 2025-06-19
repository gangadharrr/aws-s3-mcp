import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from '../utils/s3Client';
import fs from 'fs';
import { Readable } from 'stream';

interface DownloadObjectParams {
  bucketName: string;
  key: string;
  outputPath?: string;
  returnContent?: boolean;
}

interface DownloadObjectResponse {
  success: boolean;
  bucketName?: string;
  key?: string;
  outputPath?: string;
  content?: string;
  contentType?: string;
  size?: number;
  error?: string;
}

// Helper function to convert readable stream to string
async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export const downloadObjectTool = {
  name: 'download_object',
  description: 'Downloads an object from an S3 bucket',
  parameters: {
    type: 'object',
    properties: {
      bucketName: {
        type: 'string',
        description: 'Name of the bucket to download from'
      },
      key: {
        type: 'string',
        description: 'Object key (path) in the bucket'
      },
      outputPath: {
        type: 'string',
        description: 'Local file path to save the downloaded object'
      },
      returnContent: {
        type: 'boolean',
        description: 'If true, returns the object content in the response (for text files)'
      }
    },
    required: ['bucketName', 'key']
  },
  handler: async (params: DownloadObjectParams): Promise<DownloadObjectResponse> => {
    try {
      const s3Client = getS3Client();
      const { bucketName, key, outputPath, returnContent } = params;
      
      // Validate that either outputPath or returnContent is provided
      if (!outputPath && !returnContent) {
        return {
          success: false,
          error: 'Either outputPath or returnContent must be provided'
        };
      }
      
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      
      const response = await s3Client.send(command);
      
      let content: string | undefined;
      
      if (response.Body) {
        if (outputPath) {
          // Save to file
          const bodyContents = await response.Body.transformToByteArray();
          fs.writeFileSync(outputPath, Buffer.from(bodyContents));
        }
        
        if (returnContent) {
          // Convert to string for response
          if (response.Body instanceof Readable) {
            content = await streamToString(response.Body as Readable);
          } else {
            // Handle other body types if needed
            const bodyContents = await response.Body.transformToByteArray();
            content = Buffer.from(bodyContents).toString('utf-8');
          }
        }
      }
      
      return {
        success: true,
        bucketName,
        key,
        outputPath,
        content,
        contentType: response.ContentType,
        size: response.ContentLength
      };
    } catch (error: any) {
      console.error('Error downloading object:', error);
      return {
        success: false,
        error: error.message || 'Failed to download object'
      };
    }
  }
};