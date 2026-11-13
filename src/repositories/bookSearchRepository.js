export function searchActiveBooks(db, query, page, pageSize = 10) {
  // instr treats % and _ literally. Vietnamese case folding happens in application code.
  const where = 'is_active = 1 AND (instr(lower(code), @q) > 0 OR instr(title_search, @q) > 0)';
  const total = db
    .prepare(`SELECT count(*) AS count FROM books WHERE ${where}`)
    .get({ q: query }).count;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pages);
  const books = db
    .prepare(`SELECT * FROM books WHERE ${where} ORDER BY id DESC LIMIT @limit OFFSET @offset`)
    .all({ q: query, limit: pageSize, offset: (currentPage - 1) * pageSize });
  return { books, pagination: { page: currentPage, pages, total, pageSize } };
}
