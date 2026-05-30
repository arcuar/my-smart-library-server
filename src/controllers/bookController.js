//카카오 도서 api연동

const axios = require('axios');

const KAKAO_URL = 'https://dapi.kakao.com/v3/search/book';
//카카오 링크 받아ㅇㅁ

function kakaoHeaders() {
  return { Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}` };
}

function extractPrimaryIsbn(rawIsbn) {
  if (!rawIsbn || typeof rawIsbn !== 'string') return null;
  const candidates = rawIsbn
    .split(/\s+/)
    .map((v) => v.trim())
    .filter(Boolean);
  const isbn13 = candidates.find((v) => /^\d{13}$/.test(v));
  if (isbn13) return isbn13;
  const isbn10 = candidates.find((v) => /^\d{10}$/.test(v));
  return isbn10 ?? null;
}

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}

async function fetchOpenLibraryExtra(isbn) {
  try {
    const editionRes = await axios.get(`https://openlibrary.org/isbn/${isbn}.json`, {
      timeout: 5000,
    });
    const edition = editionRes.data ?? {};

    const tableOfContentsArray = Array.isArray(edition.table_of_contents)
      ? edition.table_of_contents
      : [];
    const tableOfContents = tableOfContentsArray
      .map((item) => cleanText(item?.title || item?.label || item?.chapter || ''))
      .filter(Boolean)
      .join('\n');

    const editorialReviews = [];
    const excerptArray = Array.isArray(edition.excerpts) ? edition.excerpts : [];
    excerptArray.forEach((excerpt) => {
      const raw =
        typeof excerpt === 'string' ? excerpt : excerpt?.comment || excerpt?.excerpt || excerpt?.value || '';
      const text = cleanText(raw);
      if (text) editorialReviews.push(text);
    });

    const workKey = Array.isArray(edition.works) ? edition.works[0]?.key : null;
    if (workKey) {
      const workRes = await axios.get(`https://openlibrary.org${workKey}.json`, { timeout: 5000 });
      const work = workRes.data ?? {};
      const description =
        typeof work.description === 'string' ? work.description : cleanText(work.description?.value ?? '');
      if (description) editorialReviews.push(cleanText(description));
    }

    return {
      tableOfContents: tableOfContents || null,
      editorialReviews: [...new Set(editorialReviews)].slice(0, 5),
      pageCount: Number.isFinite(edition.number_of_pages) ? edition.number_of_pages : null,
    };
  } catch {
    return {
      tableOfContents: null,
      editorialReviews: [],
      pageCount: null,
    };
  }
}

//도서검색

async function searchBooks(req, res) {
  const { query, page = 1, size = 10 } = req.query;
  if (!query) return res.status(400).json({ message: '검색어를 입력해주세요.' });

  try {
    const response = await axios.get(KAKAO_URL, {
      params: { query, page, size, target: 'title' },
      headers: kakaoHeaders(),
    });

    const books = response.data.documents.map((book) => ({
      isbn: book.isbn,
      title: book.title,
      authors: book.authors,
      translators: book.translators,
      publisher: book.publisher,
      publishedAt: book.datetime?.split('T')[0] ?? '',
      thumbnail: book.thumbnail,
      url: book.url,
      contents: book.contents,
      price: book.price,
      salePrice: book.sale_price,
      status: book.status,
    }));

    //일단 제공되는 대부분 정보 받아옴. 추후 결정

    res.json({ books, isEnd: response.data.meta.is_end, totalCount: response.data.meta.total_count });
  } catch (err) {
    res.status(500).json({ message: '도서 검색 중 오류가 발생했습니다.', error: err.message });
  }
}

//도서 상세보기

async function getBookDetail(req, res) {
  const { isbn } = req.params;
  if (!isbn) return res.status(400).json({ message: 'ISBN을 입력해주세요.' });

  try {
    const response = await axios.get(KAKAO_URL, {
      params: { query: isbn, target: 'isbn' },
      headers: kakaoHeaders(),
    });

    const doc = response.data.documents[0];
    if (!doc) return res.status(404).json({ message: '해당 도서를 찾을 수 없습니다.' });

    const primaryIsbn = extractPrimaryIsbn(doc.isbn) ?? isbn;
    const extra = await fetchOpenLibraryExtra(primaryIsbn);

    res.json({
      isbn: doc.isbn,
      title: doc.title,
      authors: doc.authors,
      translators: doc.translators,
      publisher: doc.publisher,
      publishedAt: doc.datetime?.split('T')[0] ?? '',
      thumbnail: doc.thumbnail,
      url: doc.url,
      contents: doc.contents,
      price: doc.price,
      salePrice: doc.sale_price,
      status: doc.status,
      tableOfContents: extra.tableOfContents,
      editorialReviews: extra.editorialReviews,
      pageCount: extra.pageCount,
    });
  } catch (err) {
    res.status(500).json({ message: '도서 상세 조회 중 오류가 발생했습니다.', error: err.message });
  }
}

module.exports = { searchBooks, getBookDetail };
//내보내기