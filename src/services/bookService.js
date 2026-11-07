import { bookRepository } from '../repositories/bookRepository.js';
import { searchActiveBooks } from '../repositories/bookSearchRepository.js';
import { normalizeSearch } from '../utils/normalize.js';
import { notFound } from '../utils/errors.js';
import { createBook } from './createBook.js';
import { updateBook } from './updateBook.js';
import { archiveBook } from './archiveBook.js';

export function bookService(db) {
  const repository = bookRepository(db);
  return {
    get(id) {
      const book = repository.findActive(id);
      if (!book) throw notFound();
      return book;
    },
    list: (query, page) => searchActiveBooks(db, normalizeSearch(query), page),
    create: (values) => createBook(db, repository, values),
    update: (id, values) => updateBook(db, repository, id, values),
    archive: (id) => archiveBook(db, repository, id),
  };
}
