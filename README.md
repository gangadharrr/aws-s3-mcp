# AWS S3 MCP Server

A Model Context Protocol (MCP) server for AWS S3 operations

## Features

This MCP server provides tools for interacting with AWS S3:

### Bucket Operations
- `list_buckets` - List all S3 buckets in the AWS account
- `create_bucket` - Create a new S3 bucket
- `delete_bucket` - Delete an S3 bucket (must be empty)

### Object Operations
- `list_objects` - List objects in a bucket with optional prefix filtering
- `upload_object` - Upload a file or content to a bucket
- `download_object` - Download an object from a bucket
- `delete_object` - Delete an object from a bucket

### Policy Operations
- `get_bucket_policy` - Get the policy attached to a bucket
- `set_bucket_policy` - Set or update a bucket policy


### MCP Configuration

Create a configuration file for the MCP server:

```json
{
  "mcpServers": {
    "aws-s3": {
      "command": "node",
      "args": ["path/to/aws-s3-mcp/dist/index.js"],
      "env": {
        "AWS_REGION": "us-east-1",
        "AWS_ACCESS_KEY_ID": "your-access-key-id",
        "AWS_SECRET_ACCESS_KEY": "your-secret-access-key"
      },
      "autoApprove": ["list_buckets", "list_objects", "get_bucket_policy"]
    }
  }
}
```

### Available Tools

The MCP server provides the following tools:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `list_buckets` | Lists all S3 buckets in the AWS account | None |
| `create_bucket` | Creates a new S3 bucket | `bucketName` (required), `region` (optional) |
| `delete_bucket` | Deletes an empty S3 bucket | `bucketName` (required) |
| `list_objects` | Lists objects in a bucket | `bucketName` (required), `prefix`, `maxKeys`, `continuationToken` (all optional) |
| `upload_object` | Uploads a file or content to a bucket | `bucketName`, `key` (both required), `filePath`, `content`, `contentType` (all optional) |
| `download_object` | Downloads an object from a bucket | `bucketName`, `key` (both required), `outputPath`, `returnContent` (both optional) |
| `delete_object` | Deletes an object from a bucket | `bucketName`, `key` (both required) |
| `get_bucket_policy` | Gets the policy for a bucket | `bucketName` (required) |
| `set_bucket_policy` | Sets or updates a bucket policy | `bucketName`, `policy` (both required) |

## AWS Authentication

The MCP server uses the AWS SDK, which looks for credentials in the following order:

1. Environment variables (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`)
2. Shared credentials file (`~/.aws/credentials`)
3. If running on Amazon EC2, EC2 instance metadata service

For local development, you can:

1. Set environment variables in your MCP server configuration
2. Configure the AWS CLI with `aws configure`
3. Use AWS IAM roles if running in an AWS environment

## Tool Documentation

### list_buckets

Lists all S3 buckets in the AWS account.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "buckets": [
    {
      "name": "my-bucket",
      "creationDate": "2023-01-15T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### create_bucket

Creates a new S3 bucket with the specified name.

**Parameters:**
- `bucketName` (string, required): Name of the bucket to create
- `region` (string, optional): AWS region where the bucket should be created

**Response:**
```json
{
  "success": true,
  "bucketName": "my-new-bucket",
  "location": "http://my-new-bucket.s3.amazonaws.com/"
}
```

### delete_bucket

Deletes an S3 bucket. The bucket must be empty.

**Parameters:**
- `bucketName` (string, required): Name of the bucket to delete

**Response:**
```json
{
  "success": true,
  "bucketName": "my-bucket"
}
```

### list_objects

Lists objects in an S3 bucket with optional prefix filtering.

**Parameters:**
- `bucketName` (string, required): Name of the bucket to list objects from
- `prefix` (string, optional): Filter objects by prefix (folder path)
- `maxKeys` (number, optional): Maximum number of objects to return (default: 1000)
- `continuationToken` (string, optional): Token to retrieve the next set of results

**Response:**
```json
{
  "success": true,
  "objects": [
    {
      "key": "folder/file.txt",
      "size": 1024,
      "lastModified": "2023-01-15T00:00:00.000Z",
      "etag": "\"abc123\"",
      "storageClass": "STANDARD"
    }
  ],
  "count": 1,
  "isTruncated": false
}
```

### upload_object

Uploads a file or content to an S3 bucket.

**Parameters:**
- `bucketName` (string, required): Name of the bucket to upload to
- `key` (string, required): Object key (path) in the bucket
- `filePath` (string, optional): Local file path to upload
- `content` (string, optional): String content to upload
- `contentType` (string, optional): MIME type of the content

**Response:**
```json
{
  "success": true,
  "bucketName": "my-bucket",
  "key": "folder/file.txt",
  "etag": "\"abc123\""
}
```

### download_object

Downloads an object from an S3 bucket.

**Parameters:**
- `bucketName` (string, required): Name of the bucket to download from
- `key` (string, required): Object key (path) in the bucket
- `outputPath` (string, optional): Local file path to save the downloaded object
- `returnContent` (boolean, optional): If true, returns the object content in the response

**Response:**
```json
{
  "success": true,
  "bucketName": "my-bucket",
  "key": "folder/file.txt",
  "outputPath": "/local/path/file.txt",
  "content": "File content if returnContent is true",
  "contentType": "text/plain",
  "size": 1024
}
```

### delete_object

Deletes an object from an S3 bucket.

**Parameters:**
- `bucketName` (string, required): Name of the bucket containing the object
- `key` (string, required): Object key (path) to delete

**Response:**
```json
{
  "success": true,
  "bucketName": "my-bucket",
  "key": "folder/file.txt"
}
```

### get_bucket_policy

Retrieves the policy for an S3 bucket.

**Parameters:**
- `bucketName` (string, required): Name of the bucket to get the policy for

**Response:**
```json
{
  "success": true,
  "bucketName": "my-bucket",
  "policy": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::my-bucket/*"
      }
    ]
  }
}
```

### set_bucket_policy

Sets or updates the policy for an S3 bucket.

**Parameters:**
- `bucketName` (string, required): Name of the bucket to set the policy for
- `policy` (string or object, required): The policy document as a JSON string or object

**Response:**
```json
{
  "success": true,
  "bucketName": "my-bucket"
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.