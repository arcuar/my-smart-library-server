//카카오 도서 api연동

const axios = require('axios');

const KAKAO_URL = 'https://dapi.kakao.com/v3/search/book';
//카카오 링크 받아ㅇㅁ

function kakaoHeaders() {
  return { Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}` };
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
    });
  } catch (err) {
    res.status(500).json({ message: '도서 상세 조회 중 오류가 발생했습니다.', error: err.message });
  }
}

module.exports = { searchBooks, getBookDetail };
//내보내기