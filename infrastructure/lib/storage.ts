import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'

export class AttachmentStorage extends cdk.Construct {
  public readonly attachmentBucket: s3.IBucket

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    this.attachmentBucket = new s3.Bucket(this, 'AttachmentBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
    })
  }
}
