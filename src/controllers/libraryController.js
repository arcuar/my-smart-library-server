const db = require('../db');

const ALLOWED_STATUS = new Set(['READ', 'WISH']);

function normalizeStatus(status) {
  if (typeof status !== 'string') return null;
  const v = status.toUpperCase();
  return ALLOWED_STATUS.has(v) ? v : null;
}

function parseAuthors(book) {
  if (Array.isArray(book?.authors)) return JSON.stringify(book.authors);
  if (typeof book?.author === 'string') return JSON.stringify([book.author]);
  return JSON.stringify([]);
}

function mapBookRow(row) {
  return {
    isbn: row.isbn,
    title: row.title,
    authors: JSON.parse(row.authors),
    status: row.status,
    review: row.review,
    createdAt: row.created_at,
  };
}

function addBookToLibrary(req, res) {
  const userId = req.user?.id;
  const { book, status } = req.body ?? {};

  if (!userId) return res.status(401).json({ message: '인증 정보가 없습니다.' });
  if (!book?.isbn || !book?.title) {
    return res.status(400).json({ message: 'book에 isbn/title이 필요합니다.' });
  }

  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) {
    return res.status(400).json({ message: 'status는 READ 또는 WISH만 가능합니다.' });
  }

  try {
    db.prepare(
      `INSERT INTO library_books (user_id, isbn, title, authors, status, review)
       VALUES (?, ?, ?, ?, ?, '')`,
    ).run(userId, book.isbn, book.title, parseAuthors(book), normalizedStatus);

    return res.status(201).json({
      success: true,
      message: `'${book.title}'이(가) 서재에 담겼습니다.`,
    });
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: '이미 서재에 담긴 도서입니다.' });
    }
    return res.status(500).json({ message: '서재 저장 중 오류가 발생했습니다.' });
  }
}

function getLibrary(req, res) {
  const userId = req.user?.id;
  const normalizedStatus = req.query.status ? normalizeStatus(req.query.status) : null;

  if (!userId) return res.status(401).json({ message: '인증 정보가 없습니다.' });
  if (req.query.status && !normalizedStatus) {
    return res.status(400).json({ message: 'status는 READ 또는 WISH만 가능합니다.' });
  }

  const rows = normalizedStatus
    ? db
        .prepare(
          `SELECT isbn, title, authors, status, review, created_at
           FROM library_books
           WHERE user_id = ? AND status = ?
           ORDER BY id ASC`,
        )
        .all(userId, normalizedStatus)
    : db
        .prepare(
          `SELECT isbn, title, authors, status, review, created_at
           FROM library_books
           WHERE user_id = ?
           ORDER BY id ASC`,
        )
        .all(userId);

  return res.status(200).json({
    success: true,
    count: rows.length,
    books: rows.map(mapBookRow),
  });
}

function updateLibraryBook(req, res) {
  const userId = req.user?.id;
  const { isbn } = req.params;
  const { status, review } = req.body ?? {};

  if (!userId) return res.status(401).json({ message: '인증 정보가 없습니다.' });
  const row = db
    .prepare('SELECT id, isbn, title, authors, status, review, created_at FROM library_books WHERE user_id = ? AND isbn = ?')
    .get(userId, isbn);
  if (!row) return res.status(404).json({ message: '해당 도서를 찾을 수 없습니다.' });

  const nextStatus = status === undefined ? row.status : normalizeStatus(status);
  if (status !== undefined && !nextStatus) {
    return res.status(400).json({ message: 'status는 READ 또는 WISH만 가능합니다.' });
  }
  if (review !== undefined && typeof review !== 'string') {
    return res.status(400).json({ message: 'review는 문자열이어야 합니다.' });
  }

  const nextReview = review === undefined ? row.review : review;
  db.prepare('UPDATE library_books SET status = ?, review = ? WHERE id = ?').run(
    nextStatus,
    nextReview,
    row.id,
  );

  const updated = { ...row, status: nextStatus, review: nextReview };
  return res.status(200).json({
    success: true,
    message: '서재 정보가 수정되었습니다.',
    book: mapBookRow(updated),
  });
}

function addBookComment(req, res) {
  const userId = req.user?.id;
  const { isbn } = req.params;
  const { comment } = req.body ?? {};

  if (!userId) return res.status(401).json({ message: '인증 정보가 없습니다.' });
  if (typeof comment !== 'string') {
    return res.status(400).json({ message: 'comment는 문자열이어야 합니다.' });
  }

  const row = db
    .prepare('SELECT id, isbn, title, authors, status, review, created_at FROM library_books WHERE user_id = ? AND isbn = ?')
    .get(userId, isbn);
  if (!row) return res.status(404).json({ message: '해당 도서를 찾을 수 없습니다.' });

  db.prepare('UPDATE library_books SET review = ? WHERE id = ?').run(comment, row.id);

  return res.status(200).json({
    success: true,
    message: '도서 코멘트가 저장되었습니다.',
    book: mapBookRow({ ...row, review: comment }),
  });
}

function removeLibraryBook(req, res) {
  const userId = req.user?.id;
  const { isbn } = req.params;

  if (!userId) return res.status(401).json({ message: '인증 정보가 없습니다.' });
  const result = db.prepare('DELETE FROM library_books WHERE user_id = ? AND isbn = ?').run(userId, isbn);
  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: '해당 도서를 찾을 수 없습니다.' });
  }

  return res.status(200).json({
    success: true,
    message: `ISBN: ${isbn} 도서가 삭제되었습니다.`,
  });
}

module.exports = {
  addBookToLibrary,
  getLibrary,
  updateLibraryBook,
  addBookComment,
  removeLibraryBook,
};
