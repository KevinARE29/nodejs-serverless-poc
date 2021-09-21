/**
 * @group unit
 */

const eventData = require('./exampleData.json')
const { handler } = require('./index')

describe('createMovie', () => {
  it('should return a 400 error if the name is not defined', async () => {
    const body = JSON.parse(eventData.body)

    const result = await handler({
      ...eventData,
      body: JSON.stringify({ ...body, name: null }),
    })

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body).message).toBe('name must be a string')
  })

  it('should return a 400 error if the duration is not valid', async () => {
    const body = JSON.parse(eventData.body)

    const result = await handler({
      ...eventData,
      body: JSON.stringify({ ...body, duration: '-1' }),
    })

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body).message).toBe(
      'duration must be a positive number',
    )
  })

  it('should return a 400 error if the poster is not defined', async () => {
    const body = JSON.parse(eventData.body)

    const result = await handler({
      ...eventData,
      body: JSON.stringify({ ...body, poster: null }),
    })

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body).message).toBe('poster is required')
  })

  it('should create a movie', async () => {
    const result = await handler(eventData)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(201)
    expect(body).toMatchSnapshot({
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
