import { Client } from 'pg'

exports.handler = async (event, context) => {
  let pgClient: Client

  try {
    pgClient = new Client(process.env.DATABASE_URL)
    const movieId = event.pathParameters.movie_id

    await pgClient.connect()
    const movie = (
      await pgClient.query('SELECT * FROM movies WHERE id = $1', [movieId])
    ).rows[0]

    if (!movie) {
      await pgClient.end()

      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No movie found' }),
      }
    }

    await pgClient.end()

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: movie,
        event,
        context,
      }),
    }
  } catch (err) {
    console.error(err)
    await pgClient.end()

    return {
      statusCode: 422,
      body: JSON.stringify({ message: err.message }),
    }
  }
}
