import { bookSchema, idSchema, listSchema, fieldErrors } from '../validators/bookSchemas.js';
import { DomainError } from '../utils/errors.js';

const emptyBook = {
  code: '',
  title: '',
  author: '',
  category: '',
  published_year: '',
  total_quantity: '0',
};
const successMessages = {
  created: 'Đã thêm sách.',
  updated: 'Đã cập nhật sách.',
  archived: 'Đã xóa mềm sách. Dữ liệu vẫn được lưu.',
};

export function bookController(service) {
  function parseId(req) {
    const result = idSchema.safeParse(req.params.id);
    if (!result.success) throw new DomainError('Mã định danh sách không hợp lệ.', 400);
    return result.data;
  }

  function form(res, values, errors = {}, id = null, status = 200) {
    return res
      .status(status)
      .render('books/form', { pageTitle: id ? 'Sửa sách' : 'Thêm sách', values, errors, id });
  }

  function save(req, res, id = null) {
    if (id) service.get(id);
    const values = Object.fromEntries(
      Object.keys(emptyBook).map((key) => [
        key,
        typeof req.body?.[key] === 'string' ? req.body[key] : emptyBook[key],
      ]),
    );
    const result = bookSchema.safeParse(req.body);
    if (!result.success) return form(res, values, fieldErrors(result.error), id, 422);
    try {
      if (id) service.update(id, result.data);
      else service.create(result.data);
      return res.redirect(303, `/books?notice=${id ? 'updated' : 'created'}`);
    } catch (error) {
      if (!(error instanceof DomainError) || error.status === 404) throw error;
      return form(res, values, { [error.field || '_form']: error.message }, id, error.status);
    }
  }

  return {
    index(req, res) {
      const parsed = listSchema.safeParse(req.query);
      if (!parsed.success)
        throw new DomainError(
          'Từ khóa tối đa 200 ký tự; trang phải là số nguyên dương hợp lệ.',
          400,
        );
      const { q, page } = parsed.data;
      const data = service.list(q, page);
      res.render('books/index', {
        pageTitle: 'Danh mục sách',
        q,
        ...data,
        flash: Object.hasOwn(successMessages, req.query.notice)
          ? successMessages[req.query.notice]
          : null,
      });
    },
    new(req, res) {
      return form(res, emptyBook);
    },
    create(req, res) {
      return save(req, res);
    },
    edit(req, res) {
      const id = parseId(req);
      return form(res, service.get(id), {}, id);
    },
    update(req, res) {
      return save(req, res, parseId(req));
    },
    confirmArchive(req, res) {
      res.render('books/archive', {
        pageTitle: 'Xác nhận xóa mềm',
        book: service.get(parseId(req)),
      });
    },
    archive(req, res) {
      const id = parseId(req);
      const book = service.get(id);
      if (req.body?.confirm !== 'yes')
        return res.status(422).render('books/archive', {
          pageTitle: 'Xác nhận xóa mềm',
          book,
          flash: 'Vui lòng xác nhận trước khi xóa mềm.',
        });
      try {
        service.archive(id);
        return res.redirect(303, '/books?notice=archived');
      } catch (error) {
        if (!(error instanceof DomainError)) throw error;
        return res
          .status(error.status)
          .render('books/archive', { pageTitle: 'Xác nhận xóa mềm', book, flash: error.message });
      }
    },
  };
}
