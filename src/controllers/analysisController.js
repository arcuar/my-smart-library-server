// 분석 컨트롤러 - 내 서재 분석 기능 구현
// 노션 참고해서 분석 패턴 임시로 구현

//도서 목록 으로 분석
function analyzeLibrary(req, res) {
  const { books } = req.body;
  if (!Array.isArray(books)) {
    return res.status(400).json({ message: 'books는 배열이어야 합니다.' });
  }

  if (books.length === 0) {
    return res.status(200).json({
      status: 200,
      message: '독서 성향 분석 완료',
      data: {
        tendencyTitle: '📚 이제 막 시작하는 독서가',
        summaryMessage: '아직 분석할 책이 없어요. 먼저 서재에 책을 담아보세요!',
        topAuthor: null,
        topPublisher: null,
        oldestBookYear: null,
      },
    });
  }

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

  const years = books
    .map((b) => (typeof b.datetime === 'string' ? new Date(b.datetime).getFullYear() : NaN))
    .filter((y) => Number.isFinite(y));
  const oldestBookYear = years.length > 0 ? Math.min(...years) : null;

  const topAuthor = topAuthors[0]?.name ?? null;
  const topPublisher = topPublishers[0]?.name ?? null;
  const publisherTopCount = topPublishers[0]?.count ?? 0;
  const ratio = publisherTopCount / books.length;
  const tendencyTitle =
    ratio >= 0.6
      ? '🧐 한 우물만 파는 심도 깊은 독서가'
      : '🌈 이것저것 골고루 읽는 잡식 독서가';

  res.json({
    status: 200,
    message: '독서 성향 분석 완료',
    data: {
      tendencyTitle,
      summaryMessage: `총 ${books.length}권의 책 중 ${
        topPublisher ? `'${topPublisher}' 출판사의 책을 가장 많이 담으셨네요!` : '출판사 정보가 부족해요.'
      } ${topAuthor ? `특히 '${topAuthor}' 작가의 책이 가장 많습니다.` : '작가 정보가 부족해요.'}`,
      topAuthor,
      topPublisher,
      oldestBookYear,
      // 기존 화면에서 쓰고 있다면 호환 위해 함께 제공
      topKeywords,
    },
  });
}

//반환

module.exports = { analyzeLibrary };
//내보내기