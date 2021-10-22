/**
 * @group unit
 */

const pg = require('pg')
const eventData = require('./exampleData.json')
const { handler } = require('./index')

describe('deleteMovie', () => {
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

  it('should delete a movie by uuid', async () => {
    const result = await handler({
      ...eventData,
      pathParameters: {
        movie_uuid: movie.uuid,
      },
    })

    expect(result.statusCode).toBe(204)
  })
})
