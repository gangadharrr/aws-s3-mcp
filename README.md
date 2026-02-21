# AWS S3 MCP Server

[![npm version](https://img.shields.io/npm/v/@gangadharrr/aws-s3.svg)](https://www.npmjs.com/package/@gangadharrr/aws-s3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-compatible-blue.svg)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-75%25-3178C6.svg)](https://www.typescriptlang.org)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that gives AI assistants (Claude, Cursor, etc.) direct access to AWS S3 — enabling them to list, upload, download, and manage S3 buckets and objects through natural language.

---

## Why This Exists

When building AI agent pipelines, you often need agents to read from or write to S3 — whether that's fetching documents for RAG, persisting outputs, or managing files dynamically. This MCP server bridges that gap by exposing S3 operations as MCP tools, so any MCP-compatible AI client can interact with S3 without custom integration work.

---

## Prerequisites

- Node.js 18+
- AWS account with S3 access
- AWS credentials (Access Key ID + Secret, or IAM role)
- An MCP-compatible client (Claude Desktop, Cursor, etc.)

---

## Quick Start

### 1. Install via npx (no installation needed)

```json
{
  "mcpServers": {
    "aws-s3": {
      "command": "npx",
      "args": ["@gangadharrr/aws-s3"],
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

Add this to your MCP client config file:
- **Claude Desktop:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cursor:** `.cursor/mcp.json` in your project root

### 2. Using AWS CLI credentials (recommended for local dev)

If you've already configured the AWS CLI (`aws configure`), you can omit the key env vars:

```json
{
  "mcpServers": {
    "aws-s3": {
      "command": "npx",
      "args": ["@gangadharrr/aws-s3"],
      "env": {
        "AWS_REGION": "us-east-1"
      }
    }
  }
}
```

---

## Available Tools

| Tool | Description |
|------|-------------|
| `list_buckets` | List all S3 buckets in the account |
| `create_bucket` | Create a new S3 bucket |
| `delete_bucket` | Delete an empty S3 bucket |
| `list_objects` | List objects in a bucket (with optional prefix filter) |
| `upload_object` | Upload a file or string content to a bucket |
| `download_object` | Download an object from a bucket |
| `delete_object` | Delete an object from a bucket |
| `get_bucket_policy` | Get the policy attached to a bucket |
| `set_bucket_policy` | Set or update a bucket policy |

---

## Tool Reference

### `list_buckets`
Lists all S3 buckets in the AWS account.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "buckets": [
    { "name": "my-bucket", "creationDate": "2023-01-15T00:00:00.000Z" }
  ],
  "count": 1
}
```

---

### `create_bucket`
Creates a new S3 bucket.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `bucketName` | string | ✅ | Name of the bucket to create |
| `region` | string | ❌ | AWS region (defaults to configured region) |

**Response:**
```json
{
  "success": true,
  "bucketName": "my-new-bucket",
  "location": "http://my-new-bucket.s3.amazonaws.com/"
}
```

---

### `list_objects`
Lists objects in a bucket with optional prefix filtering.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `bucketName` | string | ✅ | Bucket to list objects from |
| `prefix` | string | ❌ | Filter by prefix (folder path) |
| `maxKeys` | number | ❌ | Max results (default: 1000) |
| `continuationToken` | string | ❌ | Pagination token |

---

### `upload_object`
Uploads a file or string content to S3.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `bucketName` | string | ✅ | Target bucket |
| `key` | string | ✅ | Object key (path) in the bucket |
| `filePath` | string | ❌ | Local file path to upload |
| `content` | string | ❌ | String content to upload directly |
| `contentType` | string | ❌ | MIME type of the content |

---

### `download_object`
Downloads an object from S3.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `bucketName` | string | ✅ | Source bucket |
| `key` | string | ✅ | Object key (path) to download |
| `outputPath` | string | ❌ | Local path to save the file |
| `returnContent` | boolean | ❌ | Return content inline in response |

---

### `delete_object`
Deletes an object from a bucket.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `bucketName` | string | ✅ | Bucket containing the object |
| `key` | string | ✅ | Object key to delete |

---

### `get_bucket_policy` / `set_bucket_policy`
Get or set the IAM policy for a bucket.

**Parameters for `set_bucket_policy`:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `bucketName` | string | ✅ | Target bucket |
| `policy` | string/object | ✅ | Policy document (JSON string or object) |

---

## AWS Authentication

The server uses the AWS SDK credential resolution chain in this order:

1. **Environment variables** — `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`
2. **Shared credentials file** — `~/.aws/credentials` (configured via `aws configure`)
3. **EC2 Instance Metadata** — if running on an EC2 instance with an IAM role

For production, IAM roles are recommended over static credentials.

---

## Contributing

Contributions are welcome! If you'd like to add a new S3 operation or improve existing ones:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-tool`
3. Commit your changes: `git commit -m 'Add: new S3 tool'`
4. Push and open a Pull Request

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

*Built with the [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) and [AWS SDK v3](https://github.com/aws/aws-sdk-js-v3).*
