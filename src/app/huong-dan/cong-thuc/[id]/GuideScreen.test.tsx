// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FORMULA_SUMMARIES } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';
import { baiHuongDanFor } from '@/application/huong-dan';

import { GuideScreen } from './GuideScreen';

/**
 * Bài "Hướng dẫn sử dụng" của một công thức — WF-21.
 *
 * `huong-dan.test.ts` ở tầng Domain đã gác NỘI DUNG (bài nói đúng Registry, không bịa mục). Ca
 * kiểm này gác những thứ chỉ hỏng ở tầng màn: mục có neo bấm được, mục lục trỏ đúng chỗ, và những
 * lối ra sang màn thật — tức đúng vế *"trong hướng dẫn sử dụng có link để bấm vào các phần"*.
 */

const AS_OF = '2026-08-04';

function dungMan(id: string) {
  const bai = baiHuongDanFor(id, AS_OF);
  if (bai === undefined) throw new Error(`Không dựng được bài cho ${id}`);
  return render(
    <PreferencesProvider>
      <GuideScreen bai={bai} />
    </PreferencesProvider>,
  );
}

afterEach(cleanup);

describe('GuideScreen', () => {
  /*
   * Vế thứ hai của lời hứa ở `HEADER_TITLES`: màn nào không có tên trong bảng thì thân màn tự dựng
   * `<h1>`. Ở đây thanh trên bày nút "‹ Quay lại công thức" (xem `backLinkFor()`), nên tiêu đề
   * phải nằm trong thân — và chỉ một.
   */
  it('dựng đúng MỘT <h1>, mang tên công thức', () => {
    dungMan('pe');

    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]?.textContent).toContain('P/E');
  });

  /*
   * Năm chuỗi neo này là HỢP ĐỒNG URL — và cả năm đổi hết ở đợt 5 (03/10/2026), việc chỉ làm được
   * một lần: tính năng chưa commit, chưa ra bản nào, nên chưa có link nào tồn tại để gãy. Từ bản
   * phát hành đầu tiên trở đi, đổi một chuỗi ở đây là gãy mọi link người dùng đã copy gửi đi.
   *
   * Bốn mục cũ đi theo nội dung của chúng: `dung-de-lam-gi` · `doc-ket-qua` (bản cũ) · `sai-lam`
   * in `explanation.*` — đúng ba câu khối "Giải thích cho người mới" đang in trên cùng màn — còn
   * `can-so-gi` in bảng nhãn · đơn vị · mô tả, thứ ô nhập và Bảng biến đã in. Lý do đầy đủ ở
   * `src/core/huong-dan/types.ts`.
   */
  it('mỗi mục là một neo bấm được, và mục lục trỏ đúng vào neo ấy', () => {
    const { container } = dungMan('pe');

    const neo = [...container.querySelectorAll('section[id]')].map((el) => el.id);
    expect(neo).toEqual(['nhap-so', 'doc-ket-qua', 'doc-bieu-do', 'ket-qua-trong']);

    const mucLuc = screen.getByRole('navigation', { name: 'Trong bài này' });
    const dich = [...mucLuc.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(dich).toEqual(neo.map((id) => `#${id}`));
  });

  /*
   * Công thức không khai ca hỏng nào thì bài KHÔNG có mục "Khi kết quả hiện _ _" — thiếu mục là
   * đúng, bịa mới là sai. `phi-giao-dich-mua` là một trong 11 công thức ấy.
   */
  it('công thức không có ca hỏng nào thì không dựng mục rỗng', () => {
    const { container } = dungMan('phi-giao-dich-mua');

    const neo = [...container.querySelectorAll('section[id]')].map((el) => el.id);
    expect(neo).not.toContain('ket-qua-trong');
    expect(screen.queryByText('Khi kết quả hiện _ _')).toBeNull();
  });

  /*
   * Mục in câu của `guide-111.json` theo MÃ, qua chính `InlineWarning` của màn tính — không phải
   * một mặt vàng vẽ lại. Mã nào có mặt thì do chạy `calc` thật quyết định (`caKetQuaTrong`).
   *
   * Ca ĐỔI CHIỀU ở đợt 8 (05/10/2026). Trước đây nó ghim nguyên văn câu `calc` viết ("Chưa tính
   * được P/E vì EPS bằng 0." kèm dòng "cách sửa"); nay nó gác điều ngược lại — câu ấy KHÔNG vào
   * bài nữa, vì chủ dự án chốt bài chỉ mang chữ trong file mình giao. Câu của `calc` vẫn sống và
   * vẫn hiện trên màn tính khi lỗi xảy ra thật, nơi `formulas.test.ts` gác nó.
   */
  it('mục "Khi kết quả hiện _ _" in câu của file, không in câu của calc', () => {
    dungMan('pe');

    expect(screen.getByText('Một ô ở mẫu số đang bằng 0. Nhập số khác 0 vào ô đó.')).toBeTruthy();
    expect(
      screen.getByText(
        'Công thức vẫn tính ra một con số, nhưng con số đó không nói lên điều gì với bộ số liệu này.',
      ),
    ).toBeTruthy();

    expect(screen.queryByText('Chưa tính được P/E vì EPS bằng 0.')).toBeNull();
    expect(screen.queryByText(/Nhập EPS khác 0 hoặc chọn kỳ khác/)).toBeNull();
  });

  /*
   * Ca ĐỔI CHIỀU ở đợt 5 (03/10/2026). Trước đây nó gác việc bài IN mô tả từng ô nhập; nay nó gác
   * việc bài KHÔNG in, vì chính bảng ấy là thứ chủ dự án gọi là "viết lại thông tin của phần đó":
   * nhãn và đơn vị nằm ngay trên chính ô nhập, còn mô tả thì "Bảng biến đầu vào" ba cột ở cuối
   * trang tính in đủ. Bài thay bằng một câu chỉ đường tới bảng ấy.
   *
   * Viết thành ca kiểm chứ xoá đi, để ai thấy bảng mất thì đọc ra đây là một quyết định.
   */
  it('bài KHÔNG in lại mô tả từng ô nhập của Registry', () => {
    dungMan('pe');

    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByText('Lấy con số này ở đâu')).toBeNull();
    expect(screen.queryByText('Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.')).toBeNull();
  });

  /*
   * Thay cho bảng ấy là chữ "lấy số ở đâu" viết RIÊNG cho TỪNG Ô (`guide-111.json`, 05/10/2026) —
   * và đây là chỗ đo được khác biệt giữa hai thứ: Registry nói biến LÀ GÌ ("Lợi nhuận sau thuế
   * chia cho số cổ phiếu đang lưu hành"), còn chữ này nói LẤY SỐ ẤY Ở ĐÂU ("Báo cáo tài chính,
   * mục lãi cơ bản trên cổ phiếu").
   *
   * Ca này gác BA điều, và cả ba đều là thứ bản trước không làm được:
   *
   *   · tên ô là một `<dt>` riêng, lấy từ `spec.variables[].label` — không phải mấy chữ đầu một
   *     câu dài;
   *   · thứ tự hàng bằng đúng thứ tự `spec.variables`, tức đúng thứ tự khối Số liệu bày ô;
   *   · câu `luuY` đi kèm ô nào thì nằm trong `<dd>` của ô ấy.
   *
   * Bản trước in một `<ul>` các cụm tách từ một chuỗi " · ", nên không điều nào trong ba điều trên
   * gác được. Mộ chí của phép tách ấy ở `GuideBody.tsx`.
   */
  it('mỗi ô một hàng "lấy số liệu ở đâu", tên ô lấy từ Registry', () => {
    dungMan('pe');

    const khoi = screen.getByRole('heading', { name: 'Lấy số liệu ở đâu' }).parentElement;
    expect(khoi).not.toBeNull();

    const ten = [...(khoi?.querySelectorAll('dt') ?? [])].map((dt) => dt.textContent);
    expect(ten).toEqual(['Giá thị trường', 'EPS — lợi nhuận trên mỗi cổ phiếu']);

    const noi = [...(khoi?.querySelectorAll('dd') ?? [])].map((dd) => dd.textContent);
    expect(noi).toEqual([
      'Giá đóng cửa gần nhất trên bảng giá, hoặc nhập theo mã.',
      'Báo cáo tài chính, mục lãi cơ bản trên cổ phiếu.' +
        'Cộng bốn quý gần nhất. Lấy một quý rồi đọc như cả năm là lỗi thường gặp nhất.',
    ]);
  });

  /*
   * Mục ô nhập có ĐÚNG MỘT tiêu đề, và nó là `<h2>` của mục.
   *
   * Tới 05/10/2026 mục này in `<h3>` 'LẤY SỐ Ở ĐÂU' ngay dưới `<h2>` 'Nhập số vào đâu' của chính
   * nó — hai tiêu đề nói cùng một việc, xếp liền nhau, trước hàng ô nhập đầu tiên. Chủ dự án chỉ
   * thẳng vào tiêu đề trên và gọi nó là "text dư". Ca này gác chiều NGƯỢC: tiêu đề cũ không được
   * quay lại, và `<dl>` phải là con trực tiếp của `<section>` chứ không nằm trong một `<div>` bọc.
   *
   * Khác `KhoiBieuDo`: `<h3>` ở đó gọi tên LOẠI hình đang vẽ, tức một thông tin `<h2>` không nói.
   */
  it('mục ô nhập chỉ còn một tiêu đề, nhãn khối cũ không quay lại', () => {
    dungMan('pe');

    expect(screen.queryByRole('heading', { name: 'Nhập số vào đâu' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Lấy số ở đâu' })).toBeNull();

    const muc = screen.getByRole('heading', { name: 'Lấy số liệu ở đâu' }).parentElement;
    expect(muc?.tagName).toBe('SECTION');
    expect([...(muc?.querySelectorAll('h3') ?? [])]).toHaveLength(0);
    expect(muc?.querySelector(':scope > dl')).not.toBeNull();
  });

  /*
   * 12 trong 269 ô chỉ hiện ở chế độ Nâng cao, và bài phải nói ra điều đó NGAY CẠNH tên ô.
   *
   * Thiếu dấu ấy thì bài chỉ vào một ô mà người đọc ở chế độ Cơ bản không tìm thấy trên màn — đúng
   * lỗi đợt 5 đã trả giá một lần với "Nạp mẫu" (bài kê nút ấy cho cả 111 công thức trong khi 38
   * công thức không bày nó).
   *
   * Lấy `eps-co-ban` làm mẫu vì nó phân biệt được hai chiều trong MỘT màn: ba ô, và đúng một ô
   * (`preferredDividend`) là Nâng cao. Một công thức mà cả hai ô đều Nâng cao, như
   * `do-lech-chuan-ban-phan`, sẽ xanh cả khi dấu bị in cho mọi ô.
   */
  it('ô chỉ hiện ở chế độ Nâng cao mang dấu riêng cạnh tên', () => {
    dungMan('eps-co-ban');

    const khoi = screen.getByRole('heading', { name: 'Lấy số liệu ở đâu' }).parentElement;
    const ten = [...(khoi?.querySelectorAll('dt') ?? [])];
    expect(ten).toHaveLength(3);

    const coDau = ten
      .filter((dt) => dt.textContent?.includes('Nâng cao') === true)
      .map((dt) => dt.textContent?.replace('Nâng cao', '').trim());

    expect(coDau).toEqual(['Cổ tức ưu đãi']);
  });

  /*
   * Câu chỉ đường tới Bảng biến chỉ còn là nhánh DỰ PHÒNG cho công thức chưa ai viết bốn dòng
   * riêng. Có cả hai thì một màn hai lần trả lời cùng một câu hỏi, mà dòng riêng trả lời cụ thể
   * hơn hẳn.
   */
  it('có dòng riêng rồi thì không in thêm câu chỉ đường tới Bảng biến', () => {
    dungMan('pe');

    expect(screen.queryByText(/bảng ba cột BIẾN · ĐƠN VỊ · MÔ TẢ/)).toBeNull();
  });

  /*
   * Hai dòng "Đọc kết quả" và "Dễ sai" CHỈ sống ở trang đầy đủ — chúng gần `explanation.howToRead`
   * và `commonMistakes` của khối Giải thích, nên chúng nằm ở mục không có nút "?" nào mở. Ca kiểm
   * tương ứng ở `FormulaDetail.test.tsx` gác chiều ngược lại: không khung nào mang chúng.
   */
  it('dòng "Đọc kết quả" và "Dễ sai" riêng của công thức hiện ở trang đầy đủ', () => {
    dungMan('pe');

    expect(screen.getByText(/Cao là thị trường kỳ vọng tăng trưởng, hoặc đang đắt/)).toBeTruthy();
    expect(screen.getByText('Dễ sai:')).toBeTruthy();
    expect(screen.getByText(/Lấy EPS của một quý rồi đọc như EPS cả năm/)).toBeTruthy();
  });

  /* Dải mở đầu in câu "Để làm gì" của bài, không phải `spec.description` của khối Ý nghĩa. */
  it('dải mở đầu in câu "Để làm gì" viết riêng cho bài', () => {
    dungMan('pe');

    expect(
      screen.getByText(
        'Biết thị trường đang trả bao nhiêu đồng cho mỗi đồng lãi một năm của doanh nghiệp.',
      ),
    ).toBeTruthy();
    expect(
      screen.queryByText('Nhà đầu tư trả bao nhiêu đồng cho mỗi đồng lợi nhuận của doanh nghiệp.'),
    ).toBeNull();
  });

  /*
   * Ba câu diễn giải của khối "Giải thích cho người mới" KHÔNG được quay lại bài. Ca này gác đúng
   * lời phê đợt 5 ở tầng màn — tầng Domain đã gác bằng cách bỏ hẳn bốn trường ấy khỏi `BaiHuongDan`
   * (xem `huong-dan.test.ts`), còn đây gác điều người đọc thật sự thấy.
   */
  it('bài không in lại câu "Khi nào dùng" / "Cách đọc kết quả" / "Sai lầm thường gặp"', () => {
    dungMan('pe');

    expect(screen.queryByText(/^Dùng khi bạn đang xem một cổ phiếu/)).toBeNull();
    expect(screen.queryByText('Dùng để làm gì')).toBeNull();
    expect(screen.queryByText('Sai lầm thường gặp')).toBeNull();
    expect(screen.queryByText('Cần số gì')).toBeNull();
  });

  it('ba lối ra sang màn thật trỏ đúng ba neo của chính công thức ấy', () => {
    dungMan('pe');

    const khoi = screen.getByRole('region', { name: 'Mở màn thật' });
    const dich = [...khoi.querySelectorAll('a')].map((a) =>
      (a.getAttribute('href') ?? '').replace('/cong-thuc/pe', ''),
    );
    expect(dich).toEqual(['#khoi-so-lieu', '#khoi-vi-du', '#quiz-pe-title']);
  });

  /*
   * Mục "Đọc biểu đồ" in đoạn của ĐÚNG LOẠI hình công thức đang vẽ.
   *
   * Hai công thức, hai loại, và ca kiểm đọc chéo: `pe` vẽ đường quét độ nhạy, `ev` vẽ bóc tách.
   * Mỗi bài chỉ được mang đoạn của loại mình — lẫn sang loại kia là bài dạy đọc một hình khác với
   * hình trên màn, thứ bảy câu dùng chung của đợt 5 không thể nào bắt được vì chúng nói cho mọi
   * loại.
   */
  it('mục "Đọc biểu đồ" in đoạn của đúng loại hình, không lẫn sang loại khác', () => {
    dungMan('pe');
    expect(screen.getByText('Biểu đồ quét độ nhạy')).toBeTruthy();
    expect(screen.getByText(/biểu đồ thay đổi theo thao tác của bạn/)).toBeTruthy();
    expect(screen.queryByText('Biểu đồ bóc tách')).toBeNull();

    cleanup();

    dungMan('ev');
    expect(screen.getByText('Biểu đồ bóc tách')).toBeTruthy();
    expect(screen.getByText(/Mỗi cột là một khoản cộng vào hoặc trừ đi/)).toBeTruthy();
    expect(screen.queryByText('Biểu đồ quét độ nhạy')).toBeNull();
  });

  /*
   * ── Mộ chí: bảy ca kiểm của chữ dùng chung ──────────────────────────────────────────────
   *
   * Bỏ ngày 05/10/2026, cùng những câu chúng gác: "ô EPS chỉ sang công thức tính ra nó" · "công
   * thức cần chuỗi giá nói rõ số phiên tối thiểu" · "câu giới hạn phạm vi của thue-co-tuc cuối
   * cùng cũng hiện ra" · "công thức dùng hằng số chỉ còn lối sang Cài đặt" · "đúng 73 bài bày lối
   * Nạp mẫu" · "công thức màn không bày nút Nạp mẫu thì bài không dạy bấm nút ấy" · "câu về chế độ
   * Nâng cao chỉ đúng hai nơi có công tắc".
   *
   * Ca "73 bài bày lối Nạp mẫu" đáng nhắc riêng: nó sinh ra ở đợt 5 để sửa một lỗi THẬT — bài dạy
   * 38 công thức bấm một nút không có trên màn của họ — và nó là ca duy nhất đối chiếu bài với cờ
   * `presetHelps` của màn chi tiết. Bài giờ không dạy bấm nút nào nên lỗi ấy không còn cửa quay
   * lại, nhưng ngày nào có câu nói về nút bấm thì ca này phải sống lại cùng nó.
   *
   * Hai ca thay chỗ chúng và chặt hơn hẳn: "mỗi ô một hàng lấy số ở đâu" (gác tên ô, thứ tự ô, câu
   * lưu ý) và "ô chỉ hiện ở chế độ Nâng cao mang dấu riêng cạnh tên".
   */
});
