const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = 3000;

// 프론트엔드 JSON 데이터 파싱 설정
app.use(express.json());

// 도서관 기능 모듈 로드
const { addToLibrary, showLibrary, removeFromLibrary } = require("./library");

// 기본 서버 상태 확인 (헬스 체크)
app.get("/", (req, res) => {
  res.send("스마트 도서관 서버가 정상 작동 중입니다.");
});

// 외부 도서 검색 연동 API
app.get("/api/books/search", async (req, res) => {
  try {
    const searchWord = req.query.query; // 쿼리 파라미터에서 검색어 추출

    if (!searchWord) {
      return res.status(400).json({ message: "검색어를 입력해주세요." });
    }

    // 카카오 도서 검색 API 호출
    const url = "https://dapi.kakao.com/v3/search/book";
    const response = await axios.get(url, {
      params: { query: searchWord },
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_API_KEY}` },
    });

    // 응답받은 원본 데이터를 클라이언트로 전달
    res.status(200).json(response.data);
  } catch (error) {
    console.error("도서 검색 에러:", error.message);
    res.status(500).json({ message: "서버 내부 에러가 발생했습니다." });
  }
});

// 내 서재 도서 추가 API
app.post("/api/library", (req, res) => {
  const { book, status } = req.body;

  if (!book || !status) {
    return res
      .status(400)
      .json({ message: "책 정보나 상태가 누락되었습니다." });
  }

  // 배열에 도서 저장 후 상태 출력
  addToLibrary(book, status);
  showLibrary();

  res.status(201).json({
    success: true,
    message: `'${book.title}'이(가) 서재에 담겼습니다.`,
  });
});

// 내 서재 도서 삭제 API
app.delete("/api/library/:isbn", (req, res) => {
  const targetIsbn = req.params.isbn; // URL에서 삭제 대상 ISBN 추출

  // 배열에서 도서 삭제 시도 및 결과 확인
  const isDeleted = removeFromLibrary(targetIsbn);
  showLibrary();

  if (isDeleted) {
    res.status(200).json({
      success: true,
      message: `ISBN: ${targetIsbn} 도서가 삭제되었습니다.`,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "해당 도서를 찾을 수 없습니다.",
    });
  }
});

// 서버 포트 개방 및 대기
app.listen(port, () => {
  console.log(`서버가 켜졌습니다. 대기 주소: http://localhost:${port}`);
});
