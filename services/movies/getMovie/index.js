const pg = require('pg')
const AWS = require('aws-sdk')

const getSignedURL = (s3, path) => {
  return s3.getSignedUrl('getObject', {
    Key: path,
    Bucket: process.env.ATTACHMENT_BUCKET,
  })
}

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

    const row = (
      await pgClient.query(
        'SELECT m.*, a.path, a.key, a.ext attachment FROM movies m LEFT JOIN attachments a on m.poster_id = a.id WHERE m.uuid = $1',
        [movieUUID],
      )
    ).rows[0]

    if (!row) {
      await pgClient.end()

      return {
        statusCode: 404,
        body: JSON.stringify(errorMap.MOVIE_NOT_FOUND),
      }
    }

    await pgClient.end()

    const s3 = new AWS.S3()
    const mappedMovies = {
      uuid: row.uuid,
      name: row.name,
      synopsis: row.synopsis,
      duration: row.duration,
      price: row.price,
      likes: row.likes,
      isActive: row.is_active,
      ...(row.poster_id && {
        poster: getSignedURL(s3, `${row.path}/${row.key}.${row.ext}`),
      }),
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: mappedMovies,
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
