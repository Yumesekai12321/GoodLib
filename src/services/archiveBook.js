import { DomainError, notFound } from '../utils/errors.js';
import { openLoanCount } from '../repositories/inventoryRepository.js';

export function archiveBook(db, repository, id) {
  db.transaction(() => {
    if (!repository.findActive(id)) throw notFound();
    if (openLoanCount(db, id) > 0)
      throw new DomainError('Không thể xóa mềm sách còn cuốn chưa trả.');
    repository.archive(id, new Date().toISOString());
  }).immediate();
}
