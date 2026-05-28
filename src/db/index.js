//sql db 연동 - 사용자 개인 정보만 db에 저장하고, 내 서재는 로컬저장소이기 때문에 SQlite 사용

const Database = require('better-sqlite3');
const path = require('path'); // 경로 할당
const db = new Database(path.join(__dirname, '../../library.db'));
//파일 열고 없으면 새로 만들어서 열어줌

db.exec(`
  CREATE TABLE IF NOT EXISTS users (        
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) 
`);

// users 테이블이 존재하지 않으면 생성
// id: 고유 식별자, 자동 증가
// username: 사용자 이름, 고유
// password: 사용자 비밀번호  
// created_at: 계정 생성 시간

module.exports = db;  // 다른 파일에서 db 객체를 사용할 수 있도록 내보냄