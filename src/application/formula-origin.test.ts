import { describe, expect, it } from 'vitest';

import { formulaOriginToStore, parseFormulaOrigin } from './formula-origin';

/**
 * Bản ghi "tên công thức vừa mở bảng dữ liệu".
 *
 * Ranh giới an toàn ở đây NHẸ hơn `origin-screen.ts` một bậc, và đó là chủ ý chứ không phải sơ
 * suất: giá trị bên đó đi thẳng vào `href` nên một chuỗi `javascript:` là lỗ hổng thật; giá trị ở
 * đây chỉ đi vào phần CHỮ của thẻ `<a>`, thứ React tự thoát. Cái phải chặn vì thế là độ dài và
 * dạng slug, không phải giao thức.
 */
describe('formulaOriginToStore — lọc trước khi ghi', () => {
  it('nhận slug hợp lệ kèm tên', () => {
    expect(formulaOriginToStore('pe', 'P/E — hệ số giá trên lợi nhuận')).toEqual({
      id: 'pe',
      name: 'P/E — hệ số giá trên lợi nhuận',
    });
  });

  it('cắt khoảng trắng thừa quanh tên', () => {
    expect(formulaOriginToStore('roe', '  ROE  ')?.name).toBe('ROE');
  });

  /*
   * Cùng một luật slug với `?from=` ở `backLinkFor()`. Hai chỗ lệch nhau thì có bản ghi ghi được
   * mà không bao giờ khớp đích, tức một cái tên nằm chết trong kho.
   */
  it.each(['../pe', 'pe?x=1', 'PE', 'pe pe', ''])('loại id sai dạng slug: %j', (id) => {
    expect(formulaOriginToStore(id, 'Tên gì đó')).toBeNull();
  });

  it('loại tên rỗng — nút quay lại không được mang một nhãn trắng', () => {
    expect(formulaOriginToStore('pe', '   ')).toBeNull();
  });

  it('loại tên dài quá trần — một chuỗi khổng lồ sẽ đẩy vỡ hàng dính trên', () => {
    expect(formulaOriginToStore('pe', 'x'.repeat(121))).toBeNull();
  });
});

describe('parseFormulaOrigin — đọc lại từ kho người dùng sửa được', () => {
  it('đọc được bản ghi do chính `formulaOriginToStore` sinh ra', () => {
    const record = formulaOriginToStore('pe', 'P/E');
    expect(parseFormulaOrigin(JSON.stringify(record))).toEqual({ id: 'pe', name: 'P/E' });
  });

  it('chưa có gì thì null', () => {
    expect(parseFormulaOrigin(null)).toBeNull();
  });

  it('chuỗi không phải JSON cũng không ném lỗi lên thanh trên', () => {
    expect(parseFormulaOrigin('khong-phai-json')).toBeNull();
  });

  it.each([
    ['thiếu tên', '{"id":"pe"}'],
    ['thiếu id', '{"name":"P/E"}'],
    ['id không phải chuỗi', '{"id":1,"name":"P/E"}'],
    ['tên không phải chuỗi', '{"id":"pe","name":42}'],
    ['không phải object', '"pe"'],
    ['null', 'null'],
  ])('loại bản ghi méo: %s', (_ten, raw) => {
    expect(parseFormulaOrigin(raw)).toBeNull();
  });

  /*
   * Chỗ đọc lọc LẠI dù chỗ ghi đã lọc rồi: kho là thứ người dùng mở DevTools sửa được, nên không
   * bản ghi nào trong đó được coi là đã qua cửa.
   */
  it('bản ghi nhét tay với id sai dạng vẫn bị loại ở chỗ đọc', () => {
    expect(parseFormulaOrigin('{"id":"../../khac","name":"Tên"}')).toBeNull();
  });

  it('chuỗi dài bất thường bị chặn trước cả khi parse', () => {
    expect(parseFormulaOrigin(`{"id":"pe","name":"${'x'.repeat(600)}"}`)).toBeNull();
  });
});
