import { describe, expect, it } from 'vitest';

import {
  MAX_QUIZ_ENTRIES,
  parseQuizProgress,
  progressFor,
  recordQuizResult,
  serializeQuizProgress,
} from './quiz-progress';
import type { QuizProgress } from './quiz-progress';

const ket = (id: string, right: number, total: number, at: number): QuizProgress => ({
  id,
  right,
  total,
  wrong: [],
  at,
});

describe('đọc kết quả từ máy người dùng', () => {
  it('chuỗi rỗng, hỏng hay không phải mảng đều cho danh sách rỗng chứ không ném lỗi', () => {
    expect(parseQuizProgress(null)).toEqual([]);
    expect(parseQuizProgress('')).toEqual([]);
    expect(parseQuizProgress('{')).toEqual([]);
    expect(parseQuizProgress('{"id":"pe"}')).toEqual([]);
  });

  it('bỏ phần tử rác nhưng giữ phần tử lành ở cùng mảng', () => {
    const raw = JSON.stringify([
      { id: 'pe', right: 3, total: 5, wrong: ['Q002'], at: 1000 },
      { id: 'KHÔNG PHẢI SLUG', right: 1, total: 2, wrong: [], at: 1000 },
      { id: 'pb', right: 9, total: 2, wrong: [], at: 1000 },
      'rác',
    ]);
    expect(parseQuizProgress(raw).map((e) => e.id)).toEqual(['pe']);
  });

  it('lọc mã câu sai không đúng dạng', () => {
    const raw = JSON.stringify([
      { id: 'pe', right: 1, total: 3, wrong: ['Q002', 'xxx', 12], at: 1000 },
    ]);
    expect(parseQuizProgress(raw)[0]?.wrong).toEqual(['Q002']);
  });

  it('không giữ hai kết quả của cùng một công thức', () => {
    const raw = JSON.stringify([ket('pe', 1, 3, 2000), ket('pe', 3, 3, 1000)]);
    expect(parseQuizProgress(raw)).toHaveLength(1);
  });
});

describe('ghi kết quả', () => {
  it('làm lại thì ghi đè kết quả cũ của chính công thức ấy', () => {
    const truoc = [ket('pe', 2, 5, 1000)];
    const sau = recordQuizResult(truoc, ket('pe', 5, 5, 2000));
    expect(sau).toHaveLength(1);
    expect(sau[0]?.right).toBe(5);
  });

  it('mốc mới nhất đứng đầu', () => {
    let list = recordQuizResult([], ket('pe', 1, 2, 1000));
    list = recordQuizResult(list, ket('pb', 2, 2, 3000));
    expect(list.map((e) => e.id)).toEqual(['pb', 'pe']);
  });

  it('kết quả vô nghĩa bị bỏ, danh sách cũ giữ nguyên', () => {
    const truoc = [ket('pe', 1, 2, 1000)];
    expect(recordQuizResult(truoc, ket('pb', 5, 2, 1000))).toEqual(truoc);
    expect(recordQuizResult(truoc, ket('pb', 1, 2, -1))).toEqual(truoc);
  });

  it('đầy chỗ thì đuổi mục cũ nhất', () => {
    let list: QuizProgress[] = [];
    for (let i = 0; i < MAX_QUIZ_ENTRIES + 5; i += 1) {
      list = recordQuizResult(list, ket(`ct-${i}`, 1, 1, 1000 + i));
    }
    expect(list).toHaveLength(MAX_QUIZ_ENTRIES);
    expect(list.at(-1)?.id).toBe('ct-5');
  });

  it('ghi rồi đọc lại ra đúng thứ vừa ghi', () => {
    const list = recordQuizResult([], { id: 'pe', right: 4, total: 5, wrong: ['Q002'], at: 1000 });
    expect(parseQuizProgress(serializeQuizProgress(list))).toEqual(list);
  });
});

describe('tra kết quả của một công thức', () => {
  it('chưa làm bao giờ thì trả null', () => {
    expect(progressFor([], 'pe')).toBeNull();
  });

  it('đã làm thì trả đúng mục của công thức ấy', () => {
    const list = [ket('pb', 1, 2, 2000), ket('pe', 2, 2, 1000)];
    expect(progressFor(list, 'pe')?.right).toBe(2);
  });
});
