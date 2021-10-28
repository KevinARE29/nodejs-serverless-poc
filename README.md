# Serverless POC

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the app](#running-the-app)
- [Test](#test)

## Prerequisites

- AWS CLI
- AWS SAM
- NodeJS, npm
- Docker

For each lambda function, you must specify the following variables.

<center>

| Environment Variable Key | Environment Variable Value          |
| ------------------------ | ----------------------------------- |
| ATTACHMENT_BUCKET        | [Attachment Bucket name]            |
| AWS_REGION               | [AWS Region. i.e. us-east-2]        |
| COGNITO_CLIENT_ID        | [AWS Cognito Client ID]             |
| COGNITO_POOL_ID          | [AWS Cognito Pool ID]               |
| DATABASE_URL             | postgresql://user:pass:port/db_name |
| DOMAIN                   | [API Gateway URL]                   |

</center>

Those variables are automatically mapped by AWS Cloudformation, but if you want to run the tests locally, you have to specify a .env.test file with those variables.

In the infrastructure folder, there is a env.json.example file, copy that file and name it env.json and add the corresponding environment variables.

## Bootstrap the AWS CDK Project

```bash
$ npm run bootstrap
```

This command generates the necessary files for Cloud Formation to work with the stack.

## Installation

```bash
$ npm i
```

## Running the app

Make sure the env variables are correctly specified in infrastructure/env.json.

```bash
# In the infrastructure directory run:
$ npm run start
```

If you want to generate an id token for an existent user in AWS Cognito, you can run the following command:

```bash
$ aws cognito-idp admin-initiate-auth --region us-east-2 --cli-input-json file://auth.json
```

There is an auth.json.example file. Create the auth.json file with the corresponding values.

## Test

Running tests

```bash
# run all unit tests
$ npm run test

# run all unit tests coverage
$ npm run test:cov

# run all end to end tests
$ npm run test:e2e

# run a specific lambda unit tests (inside the lambda directory)
$ npm run test

# run a specific lambda unit tests coverage (inside the lambda directory)
$ npm run test

# run a specific lambda end to end tests (inside the lambda directory)
$ npm run test:e2e
```

## Deployment

```bash
# run the following command in the infrastructure directory
$ npx cdk deploy
```

## API Documentation

Swagger documentation it's in the api.yml file.
