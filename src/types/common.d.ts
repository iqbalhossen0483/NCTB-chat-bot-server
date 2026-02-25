type CHUNK = {
  book_name: string;
  pageStart: number;
  pageEnd: number;
  content: string;
};

type MESSAGE_HISTORY = {
  role: 'user' | 'assistant';
  content: string;
};
