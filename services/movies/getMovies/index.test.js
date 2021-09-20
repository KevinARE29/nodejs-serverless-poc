/**
 * @group unit
 */

const eventData = require('./exampleData.json')
const { handler } = require('./index')

describe('getMovies', () => {
  it('should retrieve all movies', async () => {
    const result = await handler(eventData)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(200)
    expect(body).toMatchSnapshot({
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

  it('should return a 400 error if the pagination params are not valid', async () => {
    const result = await handler({
      ...eventData,
      queryStringParameters: {
        page: '0',
      },
    })
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(400)
    expect(body.message).toBe('page must be a positive integer')
  })
})
