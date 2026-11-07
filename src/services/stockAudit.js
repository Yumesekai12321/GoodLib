import { openLoanCount } from '../repositories/inventoryRepository.js';

export function auditStock(db) {
  return db
    .prepare('SELECT id, code, total_quantity, available_quantity FROM books')
    .all()
    .flatMap((book) => {
      const outstanding = openLoanCount(db, book.id);
      const expected = book.total_quantity - outstanding;
      return book.available_quantity === expected && expected >= 0
        ? []
        : [{ ...book, outstanding, expected }];
    });
}
