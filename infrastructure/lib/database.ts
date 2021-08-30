import * as cdk from '@aws-cdk/core'
import * as rds from '@aws-cdk/aws-rds'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as secretmanager from '@aws-cdk/aws-secretsmanager'
import * as ssm from '@aws-cdk/aws-ssm'

interface DatabaseProps {
  vpc: ec2.Vpc
}

export class ApiDatabase extends cdk.Construct {
  public readonly lambdaToRDSProxyGroup: ec2.SecurityGroup
  public readonly proxy: rds.DatabaseProxy
  public readonly dbCredentialsSecret: secretmanager.Secret

  constructor(scope: cdk.Construct, id: string, props: DatabaseProps) {
    super(scope, id)

    // Security group to add an ingress rule and allow our lambdas to query the proxy
    this.lambdaToRDSProxyGroup = new ec2.SecurityGroup(
      this,
      'Lambda to RDS Proxy Connection',
      {
        vpc: props.vpc,
      },
    )

    // Security group to allow our proxy to query our PostgreSQL Instance
    const dbConnectionGroup = new ec2.SecurityGroup(
      this,
      'Proxy to DB Connection',
      {
        vpc: props.vpc,
      },
    )

    dbConnectionGroup.addIngressRule(
      dbConnectionGroup,
      ec2.Port.tcp(5432),
      'Allow db connection',
    )
    dbConnectionGroup.addIngressRule(
      this.lambdaToRDSProxyGroup,
      ec2.Port.tcp(5432),
      'Allow lambda connection',
    )

    // Dynamically generate the username and password, then store in secrets manager
    this.dbCredentialsSecret = new secretmanager.Secret(
      this,
      'DBCredentialsSecret',
      {
        secretName: id + '-rds-credentials',
        generateSecretString: {
          // TODO: username should be secret
          secretStringTemplate: JSON.stringify({
            username: 'admin_master',
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password',
        },
      },
    )

    new ssm.StringParameter(this, 'DBCredentialsArn', {
      parameterName: 'rds-credentials-arn',
      stringValue: this.dbCredentialsSecret.secretArn,
    })

    const rdsInstance = new rds.DatabaseInstance(this, 'Postgres', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_11_5,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      vpc: props.vpc,
      vpcPlacement: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [dbConnectionGroup],
      databaseName: 'movies',
      credentials: rds.Credentials.fromSecret(this.dbCredentialsSecret),
    })

    // Create an RDS Proxy
    this.proxy = rdsInstance.addProxy(id + '-proxy', {
      secrets: [this.dbCredentialsSecret],
      debugLogging: true,
      vpc: props.vpc,
      securityGroups: [dbConnectionGroup],
    })

    // Workaround for bug where TargetGroupName is not set but required
    const targetGroup = this.proxy.node.children.find((child: any) => {
      return child instanceof rds.CfnDBProxyTargetGroup
    }) as rds.CfnDBProxyTargetGroup

    targetGroup.addPropertyOverride('TargetGroupName', 'default')
  }
}
