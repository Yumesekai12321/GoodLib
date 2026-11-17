import { test, expect } from '@playwright/test';

test('E2E-01: add → Vietnamese search → edit → cancel/confirm archive', async ({ page }) => {
  await page.goto('/books');
  await page.screenshot({ path: 'artifacts/books-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Thêm sách', exact: true }).click();
  await page.getByRole('textbox', { name: 'Mã sách', exact: true }).fill('DEMO01');
  await page.getByRole('textbox', { name: 'Tên sách', exact: true }).fill('ĐƯỜNG ĐẾN THƯ VIỆN');
  await page.getByLabel('Tác giả', { exact: true }).fill('GoodLib');
  await page.getByRole('spinbutton', { name: 'Tổng số cuốn', exact: true }).fill('3');
  await page.screenshot({ path: 'artifacts/books-form.png', fullPage: true });
  await expect(page.locator('input[name="available_quantity"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Thêm sách', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã thêm sách');
  await page.getByRole('searchbox').fill('đường đến');
  await page.getByRole('button', { name: 'Tìm kiếm' }).click();
  const row = page.getByRole('row').filter({ hasText: 'DEMO01' });
  await expect(row).toContainText('ĐƯỜNG ĐẾN THƯ VIỆN');
  await row.getByRole('link', { name: 'Sửa DEMO01', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Tổng số cuốn', exact: true }).fill('5');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByRole('status')).toContainText('Đã cập nhật');
  const updated = page.getByRole('row').filter({ hasText: 'DEMO01' });
  await expect(updated.locator('td.quantity')).toHaveText(['5', '5']);
  await updated.getByRole('link', { name: 'Xóa mềm DEMO01' }).click();
  await page.getByRole('link', { name: 'Hủy', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'DEMO01' })).toHaveCount(1);
  await page.getByRole('link', { name: 'Xóa mềm DEMO01' }).click();
  await page.getByRole('button', { name: 'Xác nhận xóa mềm' }).click();
  await expect(page.getByRole('status')).toContainText('Đã xóa mềm');
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: 'DEMO01' })).toHaveCount(0);
});

test('E2E-02: duplicate code shows inline errors with retained form values', async ({ page }) => {
  await page.goto('/books/new');
  await page.getByRole('textbox', { name: 'Mã sách', exact: true }).fill('VN001');
  await page.getByRole('textbox', { name: 'Tên sách', exact: true }).fill('Tên giữ lại');
  await page.getByRole('button', { name: 'Thêm sách', exact: true }).click();
  await expect(page.locator('#code-error')).toContainText('Mã sách đã tồn tại');
  await expect(page.getByRole('textbox', { name: 'Tên sách', exact: true })).toHaveValue(
    'Tên giữ lại',
  );
  await expect(page.getByRole('alert')).toBeFocused();
});

test('E2E-03: mobile layout, empty state and keyboard search remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/books');
  await page.screenshot({ path: 'artifacts/books-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const search = page.getByRole('searchbox');
  await search.focus();
  await page.keyboard.type('khong-co-sach');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy sách phù hợp' })).toBeVisible();
  await page.getByRole('link', { name: 'Xem tất cả sách' }).click();
  await expect(page.getByRole('table')).toBeVisible();
});
