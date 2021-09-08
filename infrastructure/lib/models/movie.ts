import {
  JsonSchemaType,
  JsonSchemaVersion,
  ModelOptions,
} from '@aws-cdk/aws-apigateway'

export const createMovieModelOptions: ModelOptions = {
  contentType: 'application/json',
  modelName: 'CreateMovieModel',
  schema: {
    title: 'createMovieModel',
    schema: JsonSchemaVersion.DRAFT4,
    type: JsonSchemaType.OBJECT,
    properties: {
      name: { type: JsonSchemaType.STRING },
      descriptopm: { type: JsonSchemaType.STRING },
      duration: { type: JsonSchemaType.NUMBER, pattern: '[0-9]+' },
      price: { type: JsonSchemaType.NUMBER },
      poster: {
        type: JsonSchemaType.OBJECT,
        schema: JsonSchemaVersion.DRAFT4,
        properties: {
          contentType: {
            type: JsonSchemaType.STRING,
            enum: ['PNG', 'JPG', 'JPEG'],
          },
          ext: {
            type: JsonSchemaType.STRING,
            enum: ['PNG', 'JPG', 'JPEG'],
          },
          filename: {
            type: JsonSchemaType.STRING,
          },
        },
        required: ['contentType', 'ext', 'filename'],
      },
    },
    required: ['name', 'duration', 'price'],
  },
}

export const updateMovieModelOptions: ModelOptions = {
  ...createMovieModelOptions,
  modelName: 'UpdateMovieModel',
  schema: {
    ...createMovieModelOptions.schema,
    title: 'updateMovieModel',
    required: ['name'],
  },
}
