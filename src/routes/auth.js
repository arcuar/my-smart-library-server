//인증 라우터 

const express = require('express');
const { register, login } = require('../controllers/authController');
//두 함수 회원가입 파일에서 가져옴

const router = express.Router();
//서버에 넣기 전 먼저 묶기

router.post('/register', register);
router.post('/login', login);

module.exports = router;
//내보내기