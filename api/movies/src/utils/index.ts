import { PaginationQueryDto } from '../dtos/request/pagination-query.dto'
import { PaginationQuery } from '../interfaces'
import { PaginationDto } from '../dtos/response/pagination.dto'

// TODO: move this to a npm package

export const queryPagination = (query: PaginationQueryDto): PaginationQuery => {
  const { page, perPage } = query
  return {
    take: perPage,
    skip: (page - 1) * perPage,
  }
}

export const paginationSerializer = (
  total: number,
  query: PaginationQueryDto,
): PaginationDto => {
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
