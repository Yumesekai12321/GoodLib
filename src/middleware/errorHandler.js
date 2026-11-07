import { DomainError } from '../utils/errors.js';

// Express requires four parameters to identify error middleware.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  const expected = error instanceof DomainError;
  const status = expected ? error.status : error.status === 413 ? 413 : 500;
  if (!expected && status === 500) console.error(error);
  res.status(status).render('errors/error', {
    pageTitle: `Lỗi ${status}`,
    status,
    message: expected
      ? error.message
      : status === 413
        ? 'Biểu mẫu quá lớn.'
        : 'Không thể xử lý yêu cầu. Vui lòng thử lại.',
  });
}
