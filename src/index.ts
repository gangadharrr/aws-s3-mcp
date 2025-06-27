#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { 
  listBucketsTool,
  createBucketTool,
  deleteBucketTool,
  listObjectsTool,
  uploadObjectTool,
  downloadObjectTool,
  deleteObjectTool,
  getBucketPolicyTool,
  setBucketPolicyTool
 } from './tools';

// Create MCP server with stdio transport
const server = new McpServer({
  name: 'aws-s3-mcp',
  description: 'MCP Server for AWS S3 operations',
  version: '1.0.0',
});

// Register all tools
server.registerTool(
  "list_buckets",
  {
    title: "List Buckets",
    description: "Lists all S3 buckets in the AWS account.",
    inputSchema: {}
  },
  async () => {
    const result = await listBucketsTool.handler();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.registerTool(
  "create_bucket",
  {
    title: "Create Bucket",
    description: "Creates a new S3 bucket with the specified name.",
    inputSchema: {
      bucketName: z.string().describe("Name of the bucket to create. Must be globally unique across all AWS accounts."),
      region: z.string().optional().describe("AWS region where the bucket should be created. Defaults to the client's configured region.")
    }
  },
  async (params) => {
    const result = await createBucketTool.handler(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.registerTool(
  "delete_bucket",
  {
    title: "Delete Bucket",
    description: "Deletes an S3 bucket. The bucket must be empty.",
    inputSchema: {
      bucketName: z.string().describe("Name of the bucket to delete")
    }
  },
  async (params) => {
    const result = await deleteBucketTool.handler(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.registerTool(
  "list_objects",
  {
    title: "List Objects",
    description: "Lists objects in an S3 bucket with optional prefix filtering.",
    inputSchema: {
      bucketName: z.string().describe("Name of the bucket to list objects from"),
      prefix: z.string().optional().describe("Filter objects by prefix (folder path)"),
      maxKeys: z.number().optional().describe("Maximum number of objects to return (default: 1000, max: 1000)"),
      continuationToken: z.string().optional().describe("Token to retrieve the next set of results")
    }
  },
  async (params) => {
    const result = await listObjectsTool.handler(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.registerTool(
  "upload_object",
  {
    title: "Upload Object",
    description: "Uploads a file or content to an S3 bucket.",
    inputSchema: {
      bucketName: z.string().describe("Name of the bucket to upload to"),
      key: z.string().describe("Object key (path) in the bucket"),
      filePath: z.string().optional().describe("Local file path to upload (mutually exclusive with content)"),
      content: z.string().optional().describe("String content to upload (mutually exclusive with filePath)"),
      contentType: z.string().optional().describe("MIME type of the content (e.g., 'text/plain', 'application/json')")
    }
  },
  async (params) => {
    const result = await uploadObjectTool.handler(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.registerTool(
  "download_object",
  {
    title: "Download Object",
    description: "Downloads an object from an S3 bucket.",
    inputSchema: {
      bucketName: z.string().describe("Name of the bucket to download from"),
      key: z.string().describe("Object key (path) in the bucket"),
      outputPath: z.string().optional().describe("Local file path to save the downloaded object"),
      returnContent: z.boolean().optional().describe("If true, returns the object content in the response (for text files)")
    }
  },
  async (params) => {
    const result = await downloadObjectTool.handler(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.registerTool(
  "delete_object",
  {
    title: "Delete Object",
    description: "Deletes an object from an S3 bucket.",
    inputSchema: {
      bucketName: z.string().describe("Name of the bucket containing the object"),
      key: z.string().describe("Object key (path) to delete")
    }
  },
  async (params) => {
    const result = await deleteObjectTool.handler(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.registerTool(
  "get_bucket_policy",
  {
    title: "Get Bucket Policy",
    description: "Retrieves the policy for an S3 bucket.",
    inputSchema: {
      bucketName: z.string().describe("Name of the bucket to get the policy for")
    }
  },
  async (params) => {
    const result = await getBucketPolicyTool.handler(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.registerTool(
  "set_bucket_policy",
  {
    title: "Set Bucket Policy",
    description: "Sets or updates the policy for an S3 bucket.",
    inputSchema: {
      bucketName: z.string().describe("Name of the bucket to set the policy for"),
      policy: z.union([z.string(), z.record(z.any())]).describe("The policy document as a JSON string or object")
    }
  },
  async (params) => {
    const result = await setBucketPolicyTool.handler(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Connect to the transport
const transport = new StdioServerTransport();
server.connect(transport).catch((err) => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});

