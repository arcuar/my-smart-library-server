/**
 * 초기 설정 테스트 코드
 * 프로젝트 개발 계획에 따라 수정하고 사용하세요.
 */

import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to My Smart Library Server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
