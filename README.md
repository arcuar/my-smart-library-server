# my-smart-library-server

나의 스마트 서재 백엔드 작업 공간입니다!

※ 참고 사항
(node 모듈 동기화 시 `npm ci`활용)

1. 기술 스택

- Node.js + Express
- SQLite (사용자 계정 저장) (외부 sql 사용안함)
- 카카오 도서 검색 API (이후 가능하면 알라딘 api 사용)
- JWT (로그인 인증)

2. 작동 방법

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 서버 실행
npm start

//서버는 3000 디폴트로 설정
```

3. API 명세

로그인 후 발급받은 토큰을 이후 모든 요청 헤더에 포함 필요

4. 회원가입

POST /api/auth/register

```json
{
  "username": "홍길동",
  "password": "1234"
}
```

```json
{
  "message": "회원가입 성공"
}
```

201 = 회원가입 성공
400 = 아이디 또는 비밀번호 누락
409 = 이미 존재하는 아이디

5. 로그인

POST /api/auth/login

```json
{
  "username": "홍길동",
  "password": "1234"
}
```

```json
{
  "token": "eyJhbGci...",
  "username": "홍길동"
}
```

200 = 로그인 성공, 토큰 반환
401 = 아이디 또는 비밀번호 불일치

6. 책 검색

GET /api/books/search?query={검색어}&page={페이지}&size={개수}
Authorization: Bearer {token}

query = 검색
page = 페이지 번호
size = 페이지당 결과 수

구조

```json
{
  "books": [
    {
      "isbn":
      "title":
      "authors":
      "translators":
      "publisher":
      "publishedAt":
      "thumbnail":
      "url":
      "contents":
      "price":
      "salePrice":
      "status":
    }
  ],
  "isEnd":
  "totalCount":
}
```

200 = 검색 성공
400 = 검색어 누락
401 = 토큰 없음 또는 유효하지 않음

7. 상세 검색

GET /api/books/{isbn}/detail
Authorization: Bearer {token}

카카오에서 맨 뒤 13자리만 사용하면 된다.

상태코드 = 위와 동일

8. 성향 분석

POST /api/analysis
Authorization: Bearer {token}

localStorage에 저장된 내 서재 책 목록을 그대로 전달

```json
{
  "books": [
    {
      "authors":
      "publisher":
      "contents":
      "status":
    },
    {
      "authors":
      "publisher":
      "contents":
      "status":
    }
  ]
}
```

`status` 값 = "read" (읽은 책) 또는 "to-read" (읽을 책) 2가지

```json
{
  "totalBooks":
  "readCount":
  "toReadCount":
  "topAuthors":
  "topPublishers":
  "topKeywords":
  "summary":
}
```

200 = 분석 성공
400 = books 배열 누락 또는 빈 배열
401 = 토큰 없음 또는 유효하지 않음

//프론트에 권장사항

1. 토큰 관리 — 로그인 후 받은 토큰을 localStorage에 저장하고, 이후 모든 API 요청 헤더에 Authorization: Bearer {token} 형태로 포함
2. 내 서재 데이터 — 내 서재 담기, 수정, 삭제, 코멘트, 테마는 모두 프론트엔드 localStorage에서 관리
