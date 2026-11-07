// S1 has no lending feature. S2 can add loans without changing the stock contract.
export function openLoanCount(db, bookId) {
  const hasLoans = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='loans'")
    .get();
  if (!hasLoans) return 0;
  return db
    .prepare('SELECT count(*) AS count FROM loans WHERE book_id=? AND returned_on IS NULL')
    .get(bookId).count;
}
