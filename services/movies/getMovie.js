import { Client } from 'pg'

exports.handler = async (event, context) => {
  try {
    const client = new Client(process.env.DATABASE_URL)
    const movieId = event.pathParameters.movie_id

    await client.connect()
    const movie = (
      await client.query('SELECT * FROM movies WHERE id = $1', [movieId])
    ).rows[0]

    if (!movie) {
      await client.end()

      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No movie found' }),
      }
    }

    await client.end()

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: rows,
        event,
        context,
      }),
    }
  } catch (err) {
    await client.end()

    return {
      statusCode: 422,
      body: JSON.stringify({ message: err.message }),
    }
  }
}
