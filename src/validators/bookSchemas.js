import { z } from 'zod';

const text = (max) =>
  z
    .string({ error: 'Vui lòng nhập thông tin dạng văn bản.' })
    .trim()
    .normalize()
    .max(max, `Tối đa ${max} ký tự.`);
const integer = (min, max, message) =>
  z
    .string({ error: message })
    .trim()
    .regex(/^\d+$/, message)
    .transform(Number)
    .pipe(z.number().int().min(min, message).max(max, message));

export const bookSchema = z
  .object({
    code: text(32)
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{1,32}$/, 'Mã gồm 1–32 chữ A–Z, số, dấu _ hoặc -.'),
    title: text(200).min(1, 'Vui lòng nhập tên sách.'),
    author: text(200).default(''),
    category: text(100).default(''),
    published_year: z
      .union(
        [
          z.literal('').transform(() => null),
          integer(0, 9999, 'Năm phải là số nguyên từ 0 đến 9999.'),
        ],
        { error: 'Năm phải là số nguyên từ 0 đến 9999 hoặc để trống.' },
      )
      .default(null),
    total_quantity: integer(0, 2147483647, 'Tổng phải là số nguyên từ 0 đến 2147483647.'),
  })
  .strict();

export const idSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER));
export const listSchema = z.object({
  q: z.string().trim().normalize().max(200, 'Từ khóa tối đa 200 ký tự.').default(''),
  page: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.number().int().max(1000000))
    .default(1),
});

export function fieldErrors(error) {
  const errors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] || '_form';
    errors[key] ??=
      key === '_form'
        ? 'Biểu mẫu chứa trường không được phép. Số còn do hệ thống tính.'
        : issue.message;
  }
  return errors;
}
