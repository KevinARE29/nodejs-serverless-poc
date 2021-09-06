import { Client } from 'pg'
import { paginationSerializer } from './utils'

exports.handler = async (event, context) => {
  try {
    const { page, perPage } = event.queryStringParameters

    const client = new Client(process.env.DATABASE_URL)
    await client.connect()

    const { rows, rowCount } = await client.query(
      'SELECT * FROM movies LIMIT $1 OFFSET $2',
      [perPage, (page - 1) * perPage],
    )

    const pagination = paginationSerializer(rowCount, { page, perPage })
    await client.end()

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: rows,
        pagination,
      }),
    }
  } catch (err) {
    console.error(err)
    await client.end()

    return {
      statusCode: 422,
      body: JSON.stringify({ message: err.message }),
    }
  }
}
