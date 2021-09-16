import { Client } from 'pg'
import * as AWS from 'aws-sdk'
import { createSignedURL } from './utils'

exports.handler = async (event) => {
  let pgClient
  try {
    const { poster, ...input } = JSON.parse(event.body)

    pgClient = new Client(process.env.DATABASE_URL)
    await pgClient.connect()
    await pgClient.query('BEGIN')

    const movie = (
      await pgClient.query(
        'INSERT INTO movies(name, synopsis, duration, price) VALUES($1, $2, $3, $4) RETURNING *',
        [input.name, input.synopsis, input.duration, input.price],
      )
    ).rows[0]

    const s3 = new AWS.S3()
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

    return {
      statusCode: 200,
      body: JSON.stringify({ ...movie, poster: attachment.signedUrl }),
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
