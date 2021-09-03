import {
  JsonSchemaType,
  JsonSchemaVersion,
  ModelOptions,
} from '@aws-cdk/aws-apigateway'

export const createMovieModelOptions: ModelOptions = {
  contentType: 'application/json',
  modelName: 'CreateMovieModel',
  schema: {
    schema: JsonSchemaVersion.DRAFT4,
    title: 'createMovieModel',
    type: JsonSchemaType.OBJECT,
    properties: {
      name: { type: JsonSchemaType.STRING },
      descriptopm: { type: JsonSchemaType.STRING },
      duration: { type: JsonSchemaType.NUMBER, pattern: '[0-9]+' },
      price: { type: JsonSchemaType.NUMBER },
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
