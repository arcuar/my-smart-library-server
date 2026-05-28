//api 요청 시 토큰 검증하는 미들웨어

const jwt = require('jsonwebtoken'); //토큰 검증 패키지 가져옴

function authMiddleware(req, res, next) { // 요청에서 토큰 추출
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: '토큰이 없습니다.' });
// 토큰 검증
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); //토큰이 진짜인지 확인
    next(); //맞으면 넘어감
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
}

module.exports = authMiddleware;
//다른 파일에서 이 미들웨어를 사용할 수 있도록 내보냄
