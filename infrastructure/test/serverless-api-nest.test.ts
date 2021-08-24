import * as cdk from '@aws-cdk/core'
import { APIStack } from '../lib'

test('API Stack', () => {
  const app = new cdk.App()
  const stack = new APIStack(app, 'APIStack')

  expect(stack).toBeDefined()
})
