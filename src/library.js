// 가상의 데이터베이스 (내 서재 배열)
const myLibrary = [];

// 내 서재 담기 (Create)
function addToLibrary(book, status) {
  // 카카오 API의 authors 배열을 문자열로 합치거나, 기존 속성을 사용
  const authorName = book.authors
    ? book.authors.join(", ")
    : book.author || "작가 미상";

  const newBook = {
    isbn: book.isbn,
    title: book.title,
    author: authorName,
    status: status,
    addedAt: new Date(), // 저장된 시간 기록
  };

  myLibrary.push(newBook);
  console.log(`[성공] 서재에 "${newBook.title}"이(가) 추가되었습니다.`);
}

// 내 서재 확인 (Read)
function showLibrary() {
  console.log(`\n현재 내 서재에 담긴 도서 (총 ${myLibrary.length}권)`);

  if (myLibrary.length === 0) {
    console.log("서재가 비어 있습니다.\n");
    return;
  }

  myLibrary.forEach((book, index) => {
    console.log(
      `${index + 1}. [${book.status === "READ" ? "읽은 책" : "읽을 책"}] ${book.title} - ${book.author}`,
    );
  });
  console.log(""); // 출력 후 간격을 위한 줄바꿈
}

// 내 서재 삭제 (Delete)
function removeFromLibrary(targetIsbn) {
  // 배열에서 해당 ISBN을 가진 도서의 인덱스 탐색
  const index = myLibrary.findIndex((book) => book.isbn === targetIsbn);

  if (index !== -1) {
    const removedBook = myLibrary.splice(index, 1)[0];
    console.log(
      `[삭제 성공] 서재에서 "${removedBook.title}"이(가) 삭제되었습니다.`,
    );
    return true; // 삭제 성공 반환
  } else {
    console.log(
      `[삭제 실패] 해당 ISBN(${targetIsbn})을 가진 책이 서재에 없습니다.`,
    );
    return false; // 삭제 실패 반환
  }
}

// 외부 모듈 내보내기
module.exports = { addToLibrary, showLibrary, removeFromLibrary };
