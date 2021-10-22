const pg = require('pg')

const errorMap = {
  INVALID_UUID_ROUTE_PARAM: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'movie_uuid must be a valid uuid',
  },
  MOVIE_NOT_FOUND: {
    code: 'Not found',
    statusCode: 404,
    message: 'No Movie found',
  },
}

exports.handler = async (event) => {
  let pgClient

  try {
    const movieUUID = event.pathParameters.movie_uuid
    if (
      !movieUUID.match(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      )
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify(errorMap.INVALID_UUID_ROUTE_PARAM),
      }
    }

    pgClient = new pg.Client(process.env.DATABASE_URL)
    await pgClient.connect()

    const movie = (
      await pgClient.query('SELECT * FROM movies WHERE uuid = $1', [movieUUID])
    ).rows[0]

    if (!movie) {
      await pgClient.end()

      return {
        statusCode: 404,
        body: JSON.stringify(errorMap.MOVIE_NOT_FOUND),
      }
    }

    await pgClient.query('DELETE FROM movies WHERE uuid = $1', [movieUUID])

    await pgClient.end()

    // TODO: Delete related images from S3

    return {
      statusCode: 204,
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
