// 분석 컨트롤러 - 내 서재 분석 기능 구현
// 노션 참고해서 분석 패턴 임시로 구현

//도서 목록 으로 분석
function analyzeLibrary(req, res) {
  const { books } = req.body;
  if (!books || !Array.isArray(books) || books.length === 0)
    return res.status(400).json({ message: '분석할 도서 목록을 전달해주세요.' });

  //초기화
  const authorCount = {};
  const publisherCount = {};
  const keywords = {};

  for (const book of books) {
    for (const author of book.authors ?? []) {
      authorCount[author] = (authorCount[author] ?? 0) + 1; //작가 처음 0부터 시작
    }
    if (book.publisher) {
      publisherCount[book.publisher] = (publisherCount[book.publisher] ?? 0) + 1;
    }
    const words = (book.contents ?? '').split(/\s+/).filter((w) => w.length > 2);
    for (const word of words) {
      keywords[word] = (keywords[word] ?? 0) + 1;
    }
  }


  //가장 많이 읽은 작가, 출판사, 자주 쓰는 키워드 추출
  const topAuthors = Object.entries(authorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const topPublishers = Object.entries(publisherCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  const readCount = books.filter((b) => b.status === 'read').length;
  const toReadCount = books.filter((b) => b.status === 'to-read').length;

  res.json({
    totalBooks: books.length,
    readCount,
    toReadCount,
    topAuthors,
    topPublishers,
    topKeywords,
    summary: `총 ${books.length}권 중 ${readCount}권을 읽었어요. 자주 읽는 작가는 ${topAuthors[0]?.name ?? '없음'}이에요.`,
  });
}

//반환

module.exports = { analyzeLibrary };
//내보내기