import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SAVED_SORT,
  SAVED_SORT_KEYS,
  isDefaultSavedSort,
  nextSavedSort,
  parseSavedSort,
  serializeSavedSort,
  sortSavedRows,
  type SavedSort,
  type SavedSortFields,
} from './saved-calc-sort';

/** Ngày lưu cố ý khác nhau từng dòng; hai dòng "Biên an toàn" cùng tên, một có mã, một không. */
const ROWS: SavedSortFields[] = [
  { title: 'Lãi kép', code: undefined, savedAt: 300 },
  { title: 'Biên an toàn', code: 'BHN', savedAt: 100 },
  { title: 'Giá hoà vốn thực', code: 'APG', savedAt: 500 },
  { title: 'Biên an toàn', code: undefined, savedAt: 400 },
  { title: 'Beta', code: 'FPT', savedAt: 200 },
];

function sap(sort: SavedSort): string[] {
  return sortSavedRows(ROWS, sort, (row) => row).map(
    (row) => `${row.title}·${row.code ?? '-'}·${String(row.savedAt)}`,
  );
}

describe('nextSavedSort — vòng bấm của một tiêu đề cột', () => {
  it('Công thức và Mã: A tới Z, rồi Z tới A, rồi về mặc định (Ngày lưu, mới trước)', () => {
    for (const key of ['title', 'code'] as const) {
      const lan1 = nextSavedSort(DEFAULT_SAVED_SORT, key);
      expect(lan1).toEqual({ key, dir: 'asc' });
      const lan2 = nextSavedSort(lan1, key);
      expect(lan2).toEqual({ key, dir: 'desc' });
      expect(nextSavedSort(lan2, key)).toEqual(DEFAULT_SAVED_SORT);
    }
  });

  it('Ngày lưu: từ mặc định bấm là cũ trước, bấm nữa là về mặc định — không có trạng thái "không sắp"', () => {
    const lan1 = nextSavedSort(DEFAULT_SAVED_SORT, 'savedAt');
    expect(lan1).toEqual({ key: 'savedAt', dir: 'asc' });
    expect(nextSavedSort(lan1, 'savedAt')).toEqual(DEFAULT_SAVED_SORT);
  });

  it('đang sắp cột khác thì bấm Ngày lưu là về mặc định — chiều đầu của cột ngày là mới trước', () => {
    expect(nextSavedSort({ key: 'title', dir: 'desc' }, 'savedAt')).toEqual(DEFAULT_SAVED_SORT);
  });

  it('chỉ ba cột sắp được: Kết quả không có trong danh sách', () => {
    expect([...SAVED_SORT_KEYS]).toEqual(['title', 'code', 'savedAt']);
  });

  it('isDefaultSavedSort chỉ đúng với Ngày lưu, mới trước', () => {
    expect(isDefaultSavedSort(DEFAULT_SAVED_SORT)).toBe(true);
    expect(isDefaultSavedSort({ key: 'savedAt', dir: 'asc' })).toBe(false);
    expect(isDefaultSavedSort({ key: 'title', dir: 'desc' })).toBe(false);
  });
});

describe('sortSavedRows', () => {
  it('mặc định: mới lưu nhất lên đầu, dù mảng vào theo thứ tự nào', () => {
    expect(sap(DEFAULT_SAVED_SORT)).toEqual([
      'Giá hoà vốn thực·APG·500',
      'Biên an toàn·-·400',
      'Lãi kép·-·300',
      'Beta·FPT·200',
      'Biên an toàn·BHN·100',
    ]);
  });

  it('Ngày lưu tăng dần: cũ nhất lên đầu', () => {
    expect(sap({ key: 'savedAt', dir: 'asc' })[0]).toBe('Biên an toàn·BHN·100');
  });

  it('Công thức: thứ tự chữ tiếng Việt, hai tên trùng nhau thì dòng mới hơn đứng trước — ở cả hai chiều', () => {
    expect(sap({ key: 'title', dir: 'asc' })).toEqual([
      'Beta·FPT·200',
      'Biên an toàn·-·400',
      'Biên an toàn·BHN·100',
      'Giá hoà vốn thực·APG·500',
      'Lãi kép·-·300',
    ]);
    expect(sap({ key: 'title', dir: 'desc' })).toEqual([
      'Lãi kép·-·300',
      'Giá hoà vốn thực·APG·500',
      'Biên an toàn·-·400',
      'Biên an toàn·BHN·100',
      'Beta·FPT·200',
    ]);
  });

  it('chữ có dấu đứng cạnh chữ gốc, không dồn xuống sau "Z" như khi so theo mã ký tự', () => {
    const rows: SavedSortFields[] = [
      { title: 'Zeta', code: undefined, savedAt: 1 },
      { title: 'Ước tính', code: undefined, savedAt: 2 },
      { title: 'Tỷ suất', code: undefined, savedAt: 3 },
    ];
    expect(
      sortSavedRows(rows, { key: 'title', dir: 'asc' }, (row) => row).map((row) => row.title),
    ).toEqual(['Tỷ suất', 'Ước tính', 'Zeta']);
  });

  it('Mã: dòng không có mã đứng CUỐI ở cả hai chiều, giữa chúng vẫn mới trước', () => {
    expect(sap({ key: 'code', dir: 'asc' })).toEqual([
      'Giá hoà vốn thực·APG·500',
      'Biên an toàn·BHN·100',
      'Beta·FPT·200',
      'Biên an toàn·-·400',
      'Lãi kép·-·300',
    ]);
    expect(sap({ key: 'code', dir: 'desc' })).toEqual([
      'Beta·FPT·200',
      'Biên an toàn·BHN·100',
      'Giá hoà vốn thực·APG·500',
      'Biên an toàn·-·400',
      'Lãi kép·-·300',
    ]);
  });

  it('không đụng mảng vào, kể cả ở mặc định', () => {
    const truoc = ROWS.map((row) => row.savedAt);
    sortSavedRows(ROWS, DEFAULT_SAVED_SORT, (row) => row);
    sortSavedRows(ROWS, { key: 'title', dir: 'asc' }, (row) => row);
    expect(ROWS.map((row) => row.savedAt)).toEqual(truoc);
  });
});

describe('parseSavedSort / serializeSavedSort', () => {
  it('ghi rồi đọc lại ra đúng cách sắp', () => {
    for (const sort of [
      { key: 'title', dir: 'asc' },
      { key: 'code', dir: 'desc' },
      { key: 'savedAt', dir: 'asc' },
    ] as const) {
      expect(parseSavedSort(serializeSavedSort(sort))).toEqual(sort);
    }
  });

  it('kho trống, hỏng, cột lạ, cột Kết quả hay chiều lạ thì về mặc định — không ném lỗi', () => {
    for (const raw of [
      null,
      undefined,
      '',
      '   ',
      '{',
      'null',
      '42',
      '[]',
      '{"key":"result","dir":"asc"}',
      '{"key":"title","dir":"len"}',
      '{"dir":"asc"}',
    ]) {
      expect(parseSavedSort(raw)).toEqual(DEFAULT_SAVED_SORT);
    }
  });
});
