/*
  AWS Clients

  This file exports functions to create each of the AWS clients that will
  be used throughout this application.  By having all of these in one
  location, it will be easier to implement tracing for AWS service calls.
*/

import * as AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk'

let _s3

/**
 * Creates the Amazon S3 client for use in the application.
 *
 * @returns {object} Amazon S3 Client
 */
const s3 = () => {
  if (!_s3) {
    _s3 = AWSXRay.captureAWSClient(new AWS.S3())
  }
  return _s3
}
let _ses

/**
 * Creates the Simple Email Service (SES) client for use in the application.
 *
 * @returns {object} Simple Email Service Client
 */
const ses = () => {
  if (!_ses) {
    _ses = AWSXRay.captureAWSClient(new AWS.SES())
  }
  return _ses
}

let _eventbridge

/**
 * Creates the Eventbridge client for use in the application.
 *
 * @returns {object} Eventbridge Client
 */
const eventbridge = () => {
  if (!_eventbridge) {
    _eventbridge = AWSXRay.captureAWSClient(new AWS.EventBridge())
  }
  return _eventbridge
}

let _cisp

/**
 * Creates the Cognito Identity Service Provider client for use in the application.
 *
 * @returns {object} Cognito Identity Service Provider Client
 */
const cisp = () => {
  if (!_cisp) {
    _cisp = AWSXRay.captureAWSClient(new AWS.CognitoIdentityServiceProvider())
  }
  return _cisp
}

export const AWSClients = {
  s3,
  ses,
  eventbridge,
  cisp,
}
