const pg = require('pg')
const AWS = require('aws-sdk')
const is = require('@sindresorhus/is')

const paginationSerializer = (total, query) => {
  const { page, perPage } = query
  const itemsPerPage = total >= perPage ? perPage : total
  const totalPages = itemsPerPage > 0 ? Math.ceil(total / itemsPerPage) : null
  const prevPage = page > 1 && page <= totalPages ? page - 1 : null
  const nextPage = totalPages > 1 && page < totalPages ? page + 1 : null

  return {
    perPage: itemsPerPage,
    total,
    page,
    prevPage,
    nextPage,
    totalPages,
  }
}

const getSignedURL = (s3, path) => {
  return s3.getSignedUrl('getObject', {
    Key: path,
    Bucket: process.env.ATTACHMENT_BUCKET,
  })
}

const errorMap = {
  INVALID_PAGE_QUERY_PARAM: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'page must be a positive integer',
  },
  INVALID_PER_PAGE_QUERY_PARAM: {
    code: 'Bad Request',
    statusCode: 400,
    message: 'perPage must be a positive integer',
  },
}

module.exports.handler = async (event) => {
  let pgClient

  try {
    const page = event.queryStringParameters?.page
      ? +event.queryStringParameters?.page
      : 1
    const perPage = event.queryStringParameters?.perPage
      ? +event.queryStringParameters?.perPage
      : 10

    if (event.queryStringParameters) {
      if (!is.integer(page) || page <= 0) {
        return {
          statusCode: 400,
          body: JSON.stringify(errorMap.INVALID_PAGE_QUERY_PARAM),
        }
      }
      if (!is.integer(perPage) || perPage <= 0) {
        return {
          statusCode: 400,
          body: JSON.stringify(errorMap.INVALID_PER_PAGE_QUERY_PARAM),
        }
      }
    }

    pgClient = new pg.Client(process.env.DATABASE_URL)
    await pgClient.connect()

    const [
      {
        rows: [{ count }],
      },
      { rows },
    ] = await Promise.all([
      pgClient.query('SELECT count(id) FROM movies'),
      pgClient.query(
        'SELECT m.*, a.path, a.key, a.ext attachment FROM movies m LEFT JOIN attachments a on m.poster_id = a.id LIMIT $1 OFFSET $2',
        [perPage, (page - 1) * perPage],
      ),
    ])

    const pagination = paginationSerializer(+count, { page, perPage })
    await pgClient.end()

    const s3 = new AWS.S3()
    const mappedMovies = rows.map((row) => ({
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
    }))

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: mappedMovies,
        pagination,
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
