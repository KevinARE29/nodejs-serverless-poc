const pg = require('pg')
const is = require('@sindresorhus/is')

const errorMap = {
  INVALID_NAME_FIELD: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'name must be a string',
  },
  INVALID_SYNOPSIS_FIELD: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'synopsis must be a string',
  },
  INVALID_DURATION_FIELD: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'duration must be a positive number',
  },
  INVALID_PRICE_FIELD: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'price must be a positive number',
  },
  INVALID_POSTER_CONTENT_TYPE_FIELD: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'poster.contentType must be a string',
  },
  INVALID_POSTER_EXT_FIELD: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'poster.ext must be a string',
  },
  INVALID_DESCRIPTION_FIELD: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'poster.filename must be a string',
  },
  INVALID_UUID_ROUTE_PARAM: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'movie_uuid must be a valid uuid',
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

    const { name, synopsis, duration, price } = JSON.parse(event.body)

    if (!name || !is.string(name)) {
      return {
        statusCode: 400,
        body: JSON.stringify(errorMap.INVALID_NAME_FIELD),
      }
    }

    if (synopsis && !is.string(synopsis)) {
      return {
        statusCode: 400,
        body: JSON.stringify(errorMap.INVALID_SYNOPSIS_FIELD),
      }
    }

    if (!duration || !is.number(duration) || duration < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify(errorMap.INVALID_DURATION_FIELD),
      }
    }

    if (!price || !is.number(price) || price < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify(errorMap.INVALID_PRICE_FIELD),
      }
    }

    pgClient = new pg.Client(process.env.DATABASE_URL)
    await pgClient.connect()

    const updatedMovie = (
      await pgClient.query(
        'UPDATE movies SET name = $2, synopsis = $3, duration = $4, price = $5 WHERE uuid = $1 RETURNING *',
        [movieUUID, name, synopsis, duration, price],
      )
    ).rows[0]

    await pgClient.end()

    return {
      statusCode: 201,
      body: JSON.stringify({
        data: updatedMovie,
      }),
    }
  } catch (err) {
    console.error(err)

    await pgClient.query('ROLLBACK')
    await pgClient.end()

    return {
      statusCode: 422,
      body: JSON.stringify({ message: err.message }),
    }
  }
}
