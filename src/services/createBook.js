import { normalizeSearch } from '../utils/normalize.js';
import { DomainError } from '../utils/errors.js';

export function createBook(db, repository, values) {
  return db
    .transaction(() => {
      if (repository.findCode(values.code))
        throw new DomainError('Mã sách đã tồn tại, kể cả sách đã xóa mềm.', 409, 'code');
      const now = new Date().toISOString();
      return repository.insert({
        ...values,
        title_search: normalizeSearch(values.title),
        available_quantity: values.total_quantity,
        created_at: now,
        updated_at: now,
      });
    })
    .immediate();
}
