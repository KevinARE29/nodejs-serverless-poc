const pg = require('pg')
const { S3 } = require('aws-sdk')
const is = require('@sindresorhus/is')
const { nanoid } = require('nanoid')

const createSignedURL = async (s3, pgClient, input) => {
  const path = 'attachments/movies/{uuid}'.replace('{uuid}', input.uuid)

  const attachment = (
    await pgClient.query(
      'INSERT INTO attachments(key, path, ext, content_type) VALUES($1, $2, $3, $4) RETURNING *',
      [`${nanoid()}-${input.filename}`, path, input.ext, input.contentType],
    )
  ).rows[0]

  const signedUrl = s3.getSignedUrl('putObject', {
    Key: `${path}/${attachment.key}.${attachment.ext}`,
    ContentType: attachment.contentType,
    Bucket: process.env.ATTACHMENT_BUCKET,
  })

  return { ...attachment, signedUrl }
}

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
  MISSING_POSTER_FIELD: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'poster is required',
  },
}

exports.handler = async (event) => {
  let pgClient

  try {
    const { poster, name, synopsis, duration, price } = JSON.parse(event.body)

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

    if (!poster) {
      return {
        statusCode: 400,
        body: JSON.stringify(errorMap.MISSING_POSTER_FIELD),
      }
    }

    const { contentType, ext, filename } = poster
    if (!contentType || !is.string(contentType)) {
      return {
        statusCode: 400,
        body: JSON.stringify(errorMap.INVALID_POSTER_CONTENT_TYPE_FIELD),
      }
    }

    if (!ext || !is.string(ext)) {
      return {
        statusCode: 400,
        body: JSON.stringify(errorMap.INVALID_POSTER_EXT_FIELD),
      }
    }

    if (!filename || !is.string(filename)) {
      return {
        statusCode: 400,
        body: JSON.stringify(errorMap.INVALID_DESCRIPTION_FIELD),
      }
    }

    pgClient = new pg.Client(process.env.DATABASE_URL)
    await pgClient.connect()
    await pgClient.query('BEGIN')

    const movie = (
      await pgClient.query(
        'INSERT INTO movies(name, synopsis, duration, price) VALUES($1, $2, $3, $4) RETURNING *',
        [name, synopsis, duration, price],
      )
    ).rows[0]

    const s3 = new S3()
    const attachment = await createSignedURL(s3, pgClient, {
      contentType: poster.contentType,
      ext: poster.ext,
      filename: poster.filename,
      uuid: movie.uuid,
    })

    await pgClient.query('UPDATE movies SET poster_id = $1 WHERE id = $2', [
      attachment.id,
      movie.id,
    ])

    await pgClient.query('COMMIT')
    await pgClient.end()

    const mappedMovies = {
      uuid: movie.uuid,
      name: movie.name,
      synopsis: movie.synopsis,
      duration: movie.duration,
      price: movie.price,
      likes: movie.likes,
      isActive: movie.is_active,
      poster: attachment.signedUrl,
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        data: mappedMovies,
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
