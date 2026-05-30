const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  addBookToLibrary,
  getLibrary,
  updateLibraryBook,
  addBookComment,
  removeLibraryBook,
} = require('../controllers/libraryController');

const router = express.Router();

router.post('/', authMiddleware, addBookToLibrary);
router.get('/', authMiddleware, getLibrary);
router.patch('/:isbn', authMiddleware, updateLibraryBook);
router.patch('/:isbn/comment', authMiddleware, addBookComment);
router.delete('/:isbn', authMiddleware, removeLibraryBook);

module.exports = router;
