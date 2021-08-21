#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { APIStack } from '../lib'

const app = new cdk.App()
new APIStack(app, 'APIStack')
