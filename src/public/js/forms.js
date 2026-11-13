document.querySelector('[data-error-summary]')?.focus();
document.querySelectorAll('[data-save-form]').forEach((form) => {
  form.addEventListener('submit', () => {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Đang lưu…';
  });
});
// A page restored from the browser's back/forward cache must remain usable.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload();
});
