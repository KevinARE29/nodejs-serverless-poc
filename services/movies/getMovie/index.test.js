/**
 * @group unit
 */

const eventData = require('./exampleData.json')
const { handler } = require('./index')

describe('getMovie', () => {
  it("should return a 404 error if the uuid doesn't exists", async () => {
    const result = await handler({
      ...eventData,
      pathParameters: {
        movie_uuid: '2d495687-8b1b-4c9e-a2a6-3f8cee01dd99',
      },
    })
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(404)
    expect(body.message).toBe('No Movie found')
  })

  it('should return a 400 error if the uuid is not valid', async () => {
    const result = await handler({
      ...eventData,
      pathParameters: {
        movie_uuid: '-1',
      },
    })
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(400)
    expect(body.message).toBe('movie_uuid must be a valid uuid')
  })

  it('should retrieve a movie by uuid', async () => {
    const result = await handler(eventData)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(200)
    expect(body).toMatchSnapshot({
      data: {
        uuid: expect.any(String),
        name: expect.any(String),
        synopsis: expect.any(String),
        duration: expect.any(Number),
        price: expect.any(Number),
        likes: expect.any(Number),
        isActive: expect.any(Boolean),
        poster: expect.any(String),
      },
    })
  })
})
