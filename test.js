// 필요한 라이브러리 불러오기
const axios = require('axios');
require('dotenv').config(); // .env 파일의 환경변수

async function fetchBooks(searchWord) {
  try {
    console.log(`"${searchWord}" 검색 중...`);
    
    // 카카오 도서 검색 API 주소
    const url = 'https://dapi.kakao.com/v3/search/book';
    
    // axios.get(요청할주소, { 옵션 })
    const response = await axios.get(url, {
      params: {
        query: searchWord, // 검색어
        size: 3            // 가져올 책의 개수 일단 3개만
      },
      headers: {
        // 카카오 API의 규칙: 'KakaoAK ' 뒤에 발급받은 키를 붙여서 보냄
        Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}`
      }
    });

    // 검색 성공! 받아온 데이터 중 실제 책 데이터만 추출
    const books = response.data.documents;
    
    // 결과 출력
    console.log("=== 검색 결과 ===");
    books.forEach((book, index) => {
      console.log(`${index + 1}. 제목: ${book.title}`);
      console.log(`   작가: ${book.authors.join(', ')}`);
      console.log(`   ISBN: ${book.isbn}`);
      console.log(`   표지: ${book.thumbnail}\n`);
    });

  } catch (error) {
    // 에러 발생 시 원인
    console.error("API 호출 실패!");
    console.error(error.response ? error.response.data : error.message);
  }
}

fetchBooks("노드제이에스");