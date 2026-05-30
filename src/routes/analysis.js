//분석 라우터

const express = require('express');
const { analyzeLibrary } = require('../controllers/analysisController');
const authMiddleware = require('../middleware/auth');
//분석, 토큰 가져옴

const router = express.Router();


router.post('/', authMiddleware, analyzeLibrary);
router.post('/reading-type', authMiddleware, analyzeLibrary);

module.exports = router;
//내보냄