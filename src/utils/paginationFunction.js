const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: clients } = data
  const currentPage = page ? +page : 0
  const totalPages = Math.ceil(totalItems / limit)
  return { totalItems, clients, totalPages, currentPage }
}
const getPagination = (page, size) => {
  const limit = size ? +size : 3
  const offset = page ? page * limit : 0
  return { limit, offset }
}
module.exports = { getPagingData, getPagination }
