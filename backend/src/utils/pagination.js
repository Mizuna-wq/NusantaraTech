export function parsePagination(query, defaultLimit = 10) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

export function buildPagination(total, page, limit) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
