/**
 * @group e2e
 */

const fetch = require('node-fetch')
const AWS = require('aws-sdk')

describe('GetMovies', () => {
  const cognitoClient = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-19',
    region: 'us-east-2',
  })
  const mockUser = {
    username: 'user@mock.com',
    password: '(8#Lkk@Q',
  }
  let headers

  beforeAll(async () => {
    await cognitoClient
      .adminCreateUser({
        UserPoolId: 'us-east-2_9e54PXPux',
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
        UserPoolId: 'us-east-2_9e54PXPux',
        Username: mockUser.username,
        Password: mockUser.password,
        Permanent: true,
      })
      .promise()

    const {
      AuthenticationResult: { IdToken: token },
    } = await cognitoClient
      .adminInitiateAuth({
        UserPoolId: 'us-east-2_9e54PXPux',
        ClientId: '6j0q6d6d8u1mcu522e35oqhkdo',
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
        UserPoolId: 'us-east-2_9e54PXPux',
        Username: mockUser.username,
      })
      .promise()
  })

  it('should return a 401', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies`, {
      method: 'GET',
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
