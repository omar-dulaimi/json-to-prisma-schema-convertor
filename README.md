# JSON to Prisma Schema Convertor

[![npm version](https://badge.fury.io/js/json-to-prisma-schema-convertor.svg)](https://badge.fury.io/js/json-to-prisma-schema-convertor)
[![npm](https://img.shields.io/npm/dt/json-to-prisma-schema-convertor.svg)](https://www.npmjs.com/package/json-to-prisma-schema-convertor)
[![HitCount](https://hits.dwyl.com/omar-dulaimi/json-to-prisma-schema-convertor.svg?style=flat)](http://hits.dwyl.com/omar-dulaimi/json-to-prisma-schema-convertor)
[![npm](https://img.shields.io/npm/l/json-to-prisma-schema-convertor.svg)](LICENSE)

Convert your [JSON](https://json-schema.org) schema to an approximate [Prisma](https://github.com/prisma/prisma) Schema.

## Table of Contents

- [Installation](#installing)
- [Usage](#usage)

## Installation

Using npm:

```bash
 npm install json-to-prisma-schema-convertor
```

Using yarn:

```bash
 yarn add json-to-prisma-schema-convertor --dev
```

# Usage

1- Star this repo 😉

2- Either use npx, or add an npm script like this:

```json
{
    "scripts": {
      "json-to-prisma": "json-to-prisma-schema-convertor --schema='./schema/schema.json'"
    }
}
```

2- Running `npm run json-to-prisma` or `npx json-to-prisma-schema-convertor  --schema='./schema/schema.json'` for the following JSON schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "User": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "email": {
          "type": "string"
        },
        "weight": {
          "type": ["number", "null"]
        },
        "is18": {
          "type": ["boolean", "null"]
        },
        "name": {
          "type": ["string", "null"]
        },
        "successor": {
          "anyOf": [
            {
              "$ref": "#/definitions/User"
            },
            {
              "type": "null"
            }
          ]
        },
        "predecessor": {
          "anyOf": [
            {
              "$ref": "#/definitions/User"
            },
            {
              "type": "null"
            }
          ]
        },
        "role": {
          "type": "string",
          "default": "USER",
          "enum": ["USER", "ADMIN"]
        },
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Post"
          }
        },
        "keywords": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "biography": {
          "type": ["number", "string", "boolean", "object", "array", "null"]
        }
      }
    },
    "Post": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "user": {
          "anyOf": [
            {
              "$ref": "#/definitions/User"
            },
            {
              "type": "null"
            }
          ]
        }
      }
    }
  },
  "type": "object",
  "properties": {
    "user": {
      "$ref": "#/definitions/User"
    },
    "post": {
      "$ref": "#/definitions/Post"
    }
  }
}
```

will generate the following Prisma schema

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String
  content   String?
  published Boolean  @default(false)
  viewCount Int      @default(0)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```
