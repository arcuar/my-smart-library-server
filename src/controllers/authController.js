// 인증 컨트롤러 - 회원등록과 로그인 기능 구현

const bcrypt = require('bcryptjs'); //비밀번호 암호화 패키지 
const jwt = require('jsonwebtoken'); //토큰 생성 패키지
const db = require('../db'); //db 연동

//회원가입 
async function register(req, res) {
  const { username, password } = req.body; //프론트에서 받아옴
  if (!username || !password)
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });

  const hashed = await bcrypt.hash(password, 10); // 암호화
  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashed);
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch {
    res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
  }
}

//로그인
async function login(req, res) {
  const { username, password } = req.body; //db에서 해당 아이디 찾기 기능
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ message: '아이디 또는 비밀번호가 틀렸습니다.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: '아이디 또는 비밀번호가 틀렸습니다.' });

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '7d', //임시로 7일 설정
  });
  res.json({ token, username: user.username });
}

module.exports = { register, login };
// 내보냄
