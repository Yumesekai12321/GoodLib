export function bookRepository(db) {
  const active = db.prepare('SELECT * FROM books WHERE id = ? AND is_active = 1');
  const insert = db.prepare(`INSERT INTO books
    (code, title, title_search, author, category, published_year, total_quantity,
     available_quantity, created_at, updated_at)
    VALUES (@code, @title, @title_search, @author, @category, @published_year,
     @total_quantity, @available_quantity, @created_at, @updated_at)`);
  const update = db.prepare(`UPDATE books SET code=@code, title=@title,
    title_search=@title_search, author=@author, category=@category,
    published_year=@published_year, total_quantity=@total_quantity,
    available_quantity=@available_quantity, updated_at=@updated_at WHERE id=@id AND is_active=1`);
  return {
    findActive: (id) => active.get(id),
    findCode: (code) => db.prepare('SELECT id FROM books WHERE code = ?').get(code),
    insert: (book) => Number(insert.run(book).lastInsertRowid),
    update: (book) => update.run(book),
    archive: (id, now) =>
      db
        .prepare('UPDATE books SET is_active=0, updated_at=? WHERE id=? AND is_active=1')
        .run(now, id),
  };
}
