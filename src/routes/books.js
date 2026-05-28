//책 라우터

const express = require('express');
const { searchBooks, getBookDetail } = require('../controllers/bookController');
const authMiddleware = require('../middleware/auth');
//토큰, 로그인 사용자 책 검색 가능

const router = express.Router();

//get 요청으로 가져옴
router.get('/search', authMiddleware, searchBooks);
router.get('/:isbn/detail', authMiddleware, getBookDetail);
//api 주소 확인필요

module.exports = router;
//내보냄
