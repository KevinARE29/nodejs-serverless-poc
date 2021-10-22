/**
 * @group e2e
 */

const fetch = require('node-fetch')
const AWS = require('aws-sdk')
const pg = require('pg')
const eventData = require('./exampleData.json')

describe('UpdateMovie', () => {
  let headers
  let movie

  const cognitoClient = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-19',
    region: process.env.AWS_REGION,
  })
  const mockUser = {
    username: 'update-movie@mock.com',
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
      method: 'PUT',
      body: eventData.body,
    })

    const resBody = await res.json()

    expect(res.status).toBe(401)
    expect(resBody.message).toBe('Unauthorized')
  })

  it('should return a 401 authorization header is not valid', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies/${movie.uuid}`, {
      method: 'PUT',
      headers: { ...headers, Authorization: 'fake token' },
      body: eventData.body,
    })

    const resBody = await res.json()

    expect(res.status).toBe(401)
    expect(resBody.message).toBe('Unauthorized')
  })

  it('should return a 400 error if the name is not defined', async () => {
    const body = JSON.parse(eventData.body)

    const res = await fetch(`${process.env.DOMAIN}/movies/${movie.uuid}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...body, name: null }),
    })

    const resBody = await res.json()

    expect(res.status).toBe(400)
    expect(resBody.message).toBe('name must be a string')
  })

  it('should return a 400 error if the duration is not valid', async () => {
    const body = JSON.parse(eventData.body)

    const res = await fetch(`${process.env.DOMAIN}/movies/${movie.uuid}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...body, duration: '-1' }),
    })

    const resBody = await res.json()

    expect(res.status).toBe(400)
    expect(resBody.message).toBe('duration must be a positive number')
  })

  it('should return a 200', async () => {
    const res = await fetch(`${process.env.DOMAIN}/movies/${movie.uuid}`, {
      method: 'PUT',
      headers,
      body: eventData.body,
    })

    const resBody = await res.json()

    expect(res.status).toBe(200)
    expect(resBody).toMatchSnapshot({
      data: {
        uuid: expect.any(String),
        name: expect.any(String),
        duration: expect.any(Number),
        price: expect.any(Number),
        likes: expect.any(Number),
        isActive: expect.any(Boolean),
      },
    })
  })
})
