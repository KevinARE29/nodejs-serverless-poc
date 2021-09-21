/**
 * @group e2e
 */

const fetch = require('node-fetch')
const AWS = require('aws-sdk')

describe('GetMovies', () => {
  const cognitoClient = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-19',
    region: process.env.AWS_REGION,
  })
  const mockUser = {
    username: 'get-movies@mock.com',
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
      method: 'GET',
    })

    const resBody = await res.json()

    expect(res.status).toBe(401)
    expect(resBody.message).toBe('Unauthorized')
  })

  it('should return a 401 authorization header is not valid', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies`, {
      method: 'GET',
      headers: { ...headers, Authorization: 'fake token' },
    })

    const resBody = await res.json()

    expect(res.status).toBe(401)
    expect(resBody.message).toBe('Unauthorized')
  })

  it('should return a 200', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies?page=1&perPage=5`, {
      method: 'GET',
      headers,
    })

    const resBody = await res.json()

    expect(res.status).toBe(200)
    expect(resBody).toMatchSnapshot({
      data: expect.arrayContaining([
        {
          uuid: expect.any(String),
          name: expect.any(String),
          synopsis: expect.any(String),
          duration: expect.any(Number),
          price: expect.any(Number),
          likes: expect.any(Number),
          isActive: expect.any(Boolean),
          poster: expect.any(String),
        },
      ]),
      pagination: expect.objectContaining({
        perPage: expect.any(Number),
        page: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number),
      }),
    })
  })

  it('should return a 200 without pagination params', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies`, {
      method: 'GET',
      headers,
    })

    const resBody = await res.json()

    expect(res.status).toBe(200)
    expect(resBody).toMatchSnapshot({
      data: expect.arrayContaining([
        {
          uuid: expect.any(String),
          name: expect.any(String),
          synopsis: expect.any(String),
          duration: expect.any(Number),
          price: expect.any(Number),
          likes: expect.any(Number),
          isActive: expect.any(Boolean),
          poster: expect.any(String),
        },
      ]),
      pagination: expect.objectContaining({
        perPage: expect.any(Number),
        page: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number),
      }),
    })
  })

  it('should return a 400 for invalid pagination params', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies?page=0`, {
      method: 'GET',
      headers,
    })

    const resBody = await res.json()

    expect(res.status).toBe(400)
    expect(resBody.message).toBe('page must be a positive integer')
  })
})
