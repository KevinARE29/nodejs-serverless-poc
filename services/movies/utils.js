export const paginationSerializer = (total, query) => {
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
