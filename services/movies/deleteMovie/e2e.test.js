/**
 * @group e2e
 */

const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const pg = require('pg')

describe('DeleteMovie', () => {
  let headers
  let movie

  const cognitoClient = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-19',
    region: process.env.AWS_REGION,
  })
  const mockUser = {
    username: 'delete-movie@mock.com',
    password: '(8#Lkk@Q',
  }

  beforeAll(async () => {
    await cognitoClient
      .adminCreateUser({
        UserPoolId: process.env.COGNITO_POOL_ID,
        Username: mockUser.username,
        TemporaryPassword: mockUser.password,
        UserAttributes: [
          {
            Name: 'email',
            Value: mockUser.username,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
      })
      .promise()

    await cognitoClient
      .adminSetUserPassword({
        UserPoolId: process.env.COGNITO_POOL_ID,
        Username: mockUser.username,
        Password: mockUser.password,
        Permanent: true,
      })
      .promise()

    const {
      AuthenticationResult: { IdToken: token },
    } = await cognitoClient
      .adminInitiateAuth({
        UserPoolId: process.env.COGNITO_POOL_ID,
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: mockUser.username,
          PASSWORD: mockUser.password,
        },
      })
      .promise()

    headers = { Authorization: `Bearer ${token}` }

    pgClient = new pg.Client(process.env.DATABASE_URL)
    await pgClient.connect()

    movie = (
      await pgClient.query(
        'INSERT INTO movies(name, synopsis, duration, price) VALUES($1, $2, $3, $4) RETURNING *',
        ['name', 'synopsis', 2, 2],
      )
    ).rows[0]

    await pgClient.end()
  })

  afterAll(async () => {
    await cognitoClient
      .adminDeleteUser({
        UserPoolId: process.env.COGNITO_POOL_ID,
        Username: mockUser.username,
      })
      .promise()
  })

  it('should return a 401 authorization header is not send', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies/${movie.uuid}`, {
      method: 'DELETE',
    })

    const resBody = await res.json()

    expect(res.status).toBe(401)
    expect(resBody.message).toBe('Unauthorized')
  })

  it('should return a 401 authorization header is not valid', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies/${movie.uuid}`, {
      method: 'DELETE',
      headers: { ...headers, Authorization: 'fake token' },
    })

    const resBody = await res.json()

    expect(res.status).toBe(401)
    expect(resBody.message).toBe('Unauthorized')
  })

  it('should return a 204', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies/${movie.uuid}`, {
      method: 'DELETE',
      headers,
    })

    expect(res.status).toBe(204)
  })
})
