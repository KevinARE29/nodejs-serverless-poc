/**
 * @group unit
 */

const pg = require('pg')
const eventData = require('./exampleData.json')
const { handler } = require('./index')

describe('updateMovie', () => {
  let movie

  beforeAll(async () => {
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

  it('should update a movie', async () => {
    const result = await handler({
      ...eventData,
      pathParameters: {
        movie_uuid: movie.uuid,
      },
    })
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(201)
    expect(body).toMatchSnapshot({
      data: {
        uuid: expect.any(String),
        name: expect.any(String),
        duration: expect.any(Number),
        price: expect.any(Number),
        likes: expect.any(Number),
      },
    })
  })
})
