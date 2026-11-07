import { normalizeSearch } from '../utils/normalize.js';
import { DomainError, notFound } from '../utils/errors.js';
import { openLoanCount } from '../repositories/inventoryRepository.js';

export function updateBook(db, repository, id, values) {
  db.transaction(() => {
    if (!repository.findActive(id)) throw notFound();
    const existing = repository.findCode(values.code);
    if (existing && existing.id !== id)
      throw new DomainError('Mã sách đã tồn tại, kể cả sách đã xóa mềm.', 409, 'code');
    const outstanding = openLoanCount(db, id);
    if (values.total_quantity < outstanding)
      throw new DomainError(
        `Tổng không được thấp hơn ${outstanding} cuốn chưa trả.`,
        409,
        'total_quantity',
      );
    repository.update({
      ...values,
      id,
      title_search: normalizeSearch(values.title),
      available_quantity: values.total_quantity - outstanding,
      updated_at: new Date().toISOString(),
    });
  }).immediate();
}
