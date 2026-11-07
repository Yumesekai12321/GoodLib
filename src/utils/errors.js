export class DomainError extends Error {
  constructor(message, status = 409, field = null) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

export const notFound = () => new DomainError('Không tìm thấy sách đang hoạt động.', 404);
