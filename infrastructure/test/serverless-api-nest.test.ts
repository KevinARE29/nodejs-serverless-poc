import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { APIStack } from '../lib'

test('Empty Stack', () => {
  const app = new cdk.App()
  // WHEN
  const stack = new APIStack(app, 'MyTestStack')
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT,
    ),
  )
})
