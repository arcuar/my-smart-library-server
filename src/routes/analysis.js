//분석 라우터

const express = require('express');
const { analyzeLibrary } = require('../controllers/analysisController');
const authMiddleware = require('../middleware/auth');
//분석, 토큰 가져옴

const router = express.Router();


//get 안되서 post로 바꿈
router.post('/', authMiddleware, analyzeLibrary);

module.exports = router;
//내보냄