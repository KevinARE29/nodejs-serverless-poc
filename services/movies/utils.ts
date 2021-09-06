import { nanoid } from 'nanoid'
import * as AWS from 'aws-sdk'
import { Client } from 'pg'

export const paginationSerializer = (
  total: number,
  query: { page: number; perPage: number },
) => {
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

export const getSignedURL = (s3: AWS.S3, path: string) => {
  return s3.getSignedUrl('getObject', {
    Key: path,
    Bucket: process.env.ATTACHMENT_BUCKET,
  })
}

export const createSignedURL = async (s3: AWS.S3, pgClient: Client, input) => {
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
