/**
 * @group e2e
 */

const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const eventData = require('./exampleData.json')

describe('CreateMovie', () => {
  const cognitoClient = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-19',
    region: process.env.AWS_REGION,
  })
  const mockUser = {
    username: 'create-movie@mock.com',
    password: '(8#Lkk@Q',
  }
  let headers

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
    const res = await fetch(`${process.env.DOMAIN}/movies`, {
      method: 'POST',
    })

    const resBody = await res.json()

    expect(res.status).toBe(401)
    expect(resBody.message).toBe('Unauthorized')
  })

  it('should return a 401 authorization header is not valid', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies`, {
      method: 'POST',
      headers: { ...headers, Authorization: 'fake token' },
    })

    const resBody = await res.json()

    expect(res.status).toBe(401)
    expect(resBody.message).toBe('Unauthorized')
  })

  it('should return a 400 error if the name is not defined', async () => {
    const body = JSON.parse(eventData.body)

    const res = await fetch(`${process.env.DOMAIN}/movies`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...body, name: null }),
    })

    const resBody = await res.json()

    expect(res.status).toBe(400)
    expect(resBody.message).toBe('name must be a string')
  })

  it('should return a 400 error if the duration is not valid', async () => {
    const body = JSON.parse(eventData.body)

    const res = await fetch(
      `${process.env.DOMAIN}/movies

    `,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...body, duration: '-1' }),
      },
    )

    const resBody = await res.json()

    expect(res.status).toBe(400)
    expect(resBody.message).toBe('duration must be a positive number')
  })

  it('should return a 400 error if the poster is not defined', async () => {
    const body = JSON.parse(eventData.body)

    const res = await fetch(
      `${process.env.DOMAIN}/movies

    `,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...body, poster: null }),
      },
    )

    const resBody = await res.json()

    expect(res.status).toBe(400)
    expect(resBody.message).toBe('poster is required')
  })

  it('should return a 201', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies`, {
      method: 'POST',
      headers,
      body: eventData.body,
    })

    const resBody = await res.json()

    expect(res.status).toBe(201)
    expect(resBody).toMatchSnapshot({
      data: {
        uuid: expect.any(String),
        name: expect.any(String),
        duration: expect.any(Number),
        price: expect.any(Number),
        likes: expect.any(Number),
        isActive: expect.any(Boolean),
        poster: expect.any(String),
      },
    })
  })
})
