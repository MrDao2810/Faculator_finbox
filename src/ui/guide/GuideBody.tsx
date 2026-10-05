import type { BaiHuongDan, ChartType, MessageKey, MucId, ONhapHuongDan } from '@/application';
import { Pick } from '@/ui/i18n/Pick';
import { T } from '@/ui/i18n/T';

import { GuideWarning } from './GuideWarning';
import styles from './GuideBody.module.css';

/**
 * Thân bài "Hướng dẫn sử dụng" — bốn mục, dùng CHUNG cho trang đầy đủ và cho khung mở tại nút
 * (WF-21, đợt 2 — 02/10/2026; nội dung viết lại ở đợt 5, rồi thay hẳn ở đợt 8 — 05/10/2026).
 *
 * ── Bài CHỈ mang chữ chủ dự án giao, không câu nào khác ──────────────────────────────────────
 *
 * Đây là luật mạnh nhất của file, và nó là lời chốt của chủ dự án ngày 05/10/2026: *"câu thừa
 * trước đó thì bỏ đi, chỉ để lại những câu đã tạo trong file tôi gửi thôi"*. Mọi chữ trên màn này
 * phải truy được về `guide-111.json`:
 *
 * | Mục              | In gì                            | Khoá trong file                |
 * | ---------------- | -------------------------------- | ------------------------------ |
 * | dải mở đầu trang | `deLamGi`                        | `formulas[id].purpose`         |
 * | `#nhap-so`       | một hàng mỗi ô nhập              | `variables[id][key].where/hint`|
 * | `#doc-ket-qua`   | `docKetQua` rồi `deSai`          | `.read` · `.pitfall`           |
 * | `#doc-bieu-do`   | một đoạn theo LOẠI biểu đồ       | `charts[kind]`                 |
 * | `#ket-qua-trong` | một câu mỗi mã cảnh báo          | `warnings[code]`               |
 *
 * Đợt 5 có thêm một mục `#hieu-cong-thuc` và khoảng hai mươi câu thao tác dùng chung (bốn đường
 * nạp số, câu số phiên tối thiểu, câu chế độ Nâng cao, câu hằng số, bốn bước "làm gì tiếp", bảy
 * bước đọc biểu đồ). Tất cả đã đi. Lý do không phải chúng sai — phần lớn đúng và đã soi trên màn
 * thật — mà là chúng TẢ LẠI thứ màn đã bày, đúng loại chữ chủ dự án đã gọi tên ở đợt 5 ("Mức phí
 * và thuế đang hiệu lực do sản phẩm tự tra…") và nay chốt bỏ hết.
 *
 * Hệ quả cấu trúc, và nó là cách giữ luật này không trôi: **file này không còn `<T>` nào cho NỘI
 * DUNG** — `<T>` chỉ còn in tiêu đề mục và hai nhãn khối. Thêm một `<T k="guide.…">` mang câu chữ
 * vào đây là đang dựng lại thứ vừa gỡ.
 *
 * ── Vì sao MỘT renderer, không phải hai ──────────────────────────────────────────────────────
 *
 * Bản vẽ HD-04 nói khung và trang là "hai cách hiện, một nội dung". Dựng hai cây JSX song song
 * thì câu ấy thành một lời hứa phải nhớ giữ, và nó trôi ngay ở lần sửa thứ hai.
 *
 * Nó ĐÃ TRÔI, đúng như vậy, và chỉ sống được một ngày: đợt 4 tách `GuideMuc` ra rồi để `GuideBody`
 * giữ nguyên bản `switch` cũ của nó, nên trong một file có hai chuỗi `muc === '…'` song song, khác
 * nhau ở ba cái link. Docblock cũ của chính chỗ này hứa ngược lại. Đợt 5 sửa bằng cấu trúc, cách
 * duy nhất không trôi lại được: `GuideBody` CHỈ map `mucCo` qua `<GuideMuc>`, không biết một mục
 * nào trông ra sao.
 *
 * ── Vì sao KHÔNG `'use client'` ──────────────────────────────────────────────────────────────
 *
 * Trang đầy đủ là server component, nên thân bài phải dựng được ở server (chữ nằm sẵn trong HTML
 * tĩnh: đọc được khi mất mạng, in được, bộ máy tìm kiếm đọc được). Khung tại nút thì là client, và
 * một component không khai `'use client'` được phép dùng ở cả hai phía — nó đi theo nơi gọi. Hệ
 * quả bắt buộc: mọi chữ đi qua lá `<T>` / `<Pick>`, không gọi hook trực tiếp.
 *
 * Đợt 8 bỏ hết link ra khỏi thân bài, nên bẫy "truyền hàm từ server component sang `next/link`" —
 * thứ từng làm `/huong-dan/cong-thuc/<id>/` trả 500 suốt ba đợt — không còn cửa nào để quay lại.
 * Mộ chí của `LoiRa` và prop `onRoiBai` ở cuối file ghi đủ, vì nó là bài học đắt.
 *
 * ── KHÔNG xuất qua barrel `@/ui/guide` ───────────────────────────────────────────────────────
 *
 * Cùng luật với `ChainBody` và `QuizBody`: barrel chỉ xuất `GuideHint`. Xuất thân bài ra barrel là
 * mang nó vào gói của mọi trang nhập barrel ấy.
 */

/** Tiêu đề của từng mục — khoá i18n, đúng thứ tự `THU_TU_MUC` ở tầng Domain. */
const TIEU_DE: Readonly<Record<MucId, MessageKey>> = {
  'nhap-so': 'guide.section.input',
  'doc-ket-qua': 'guide.section.result',
  'doc-bieu-do': 'guide.section.chart',
  'ket-qua-trong': 'guide.section.blank',
};

/**
 * Đoạn chữ của từng LOẠI biểu đồ — chép từ khối `charts` của `guide-111.json`.
 *
 * Viết tường minh chứ dựng khoá bằng `guide.chartKind.${kieu}.title`, và đó không phải thẩm mỹ:
 * cửa gác "khoá mồ côi" ở `i18n.test.ts` tìm CHÍNH chuỗi khoá trong `src/`, nên một khoá chỉ tồn
 * tại dưới dạng chuỗi mẫu sẽ bị báo là không ai dùng. Bảng tường minh còn cho TypeScript kiểm thật
 * kiểu `MessageKey` thay vì một phép ép kiểu. Cùng khuôn `NAP_SO` của đợt 5.
 *
 * Mười loại, dù Registry hiện chỉ dùng tám: `ChartType` khai cả `heatmap` và `tornado`, nên thiếu
 * hai dòng ấy là một lỗ chờ sẵn cho công thức đầu tiên dùng tới. `none` không có mặt — 9 công thức
 * ấy không dựng mục biểu đồ, nên `kieuBieuDo` của chúng là `undefined`.
 */
const CHU_BIEU_DO: Readonly<
  Record<Exclude<ChartType, 'none'>, { tieuDe: MessageKey; than: MessageKey }>
> = {
  sensitivity: {
    tieuDe: 'guide.chartKind.sensitivity.title',
    than: 'guide.chartKind.sensitivity.body',
  },
  waterfall: { tieuDe: 'guide.chartKind.waterfall.title', than: 'guide.chartKind.waterfall.body' },
  stackedBar: {
    tieuDe: 'guide.chartKind.stackedBar.title',
    than: 'guide.chartKind.stackedBar.body',
  },
  candlestick: {
    tieuDe: 'guide.chartKind.candlestick.title',
    than: 'guide.chartKind.candlestick.body',
  },
  histogram: { tieuDe: 'guide.chartKind.histogram.title', than: 'guide.chartKind.histogram.body' },
  underwater: {
    tieuDe: 'guide.chartKind.underwater.title',
    than: 'guide.chartKind.underwater.body',
  },
  scatter: { tieuDe: 'guide.chartKind.scatter.title', than: 'guide.chartKind.scatter.body' },
  heatmap: { tieuDe: 'guide.chartKind.heatmap.title', than: 'guide.chartKind.heatmap.body' },
  tornado: { tieuDe: 'guide.chartKind.tornado.title', than: 'guide.chartKind.tornado.body' },
};

/*
 * `tachCum()` ĐÃ BỎ (05/10/2026) — mộ chí, vì nó rất dễ bị dựng lại.
 *
 * Nó tách dòng "Cần nhập" theo dấu " · " để in thành danh sách. Phép tách ấy không sai, nó chỉ
 * không gắn được vào ô nào: 74/111 công thức có số cụm khác số ô, nên không cách nào biết cụm thứ
 * hai đang nói về ô nào. `oNhap` thay nó bằng dữ liệu có khoá, và cùng lúc bỏ luôn hai cửa gác chỉ
 * tồn tại để đỡ cho phép tách ("cụm rỗng", "số cụm bản `en` phải khớp bản `vi`").
 *
 * Đừng dựng lại: chuỗi một dòng không còn trong kho nữa, và đã có khoá thì không còn gì để tách.
 */

/**
 * Mục lục của bài — mỗi mục một `<a href="#neo">` thật.
 *
 * Bấm được cả khi JS chưa tải xong, copy được từ thanh địa chỉ. Đó đúng là vế "có link để bấm vào
 * các phần" của yêu cầu gốc.
 *
 * Hai prop `onPick` và `hrefMuc` của đợt 2 đã BỎ ở đợt 5: chúng sinh ra cho ngăn kéo mang cả bài,
 * thứ đã gỡ ngày 03/10/2026, và từ đó tới lúc gỡ không nơi nào truyền chúng — một nhánh code chết
 * kèm hai docblock dài tả hành vi không còn tồn tại. Khung tại nút chỉ mang MỘT mục nên nó không
 * có mục lục; cần cả bài thì đi theo "Mở toàn trang".
 */
export function GuideToc({ mucCo }: { mucCo: ReadonlyArray<MucId> }) {
  return (
    <ol className={styles.toc}>
      {mucCo.map((muc) => (
        <li key={muc}>
          <a className={styles.tocLink} href={`#${muc}`}>
            <T k={TIEU_DE[muc]} />
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * MỘT mục của bài — đơn vị nội dung thật, và là thứ khung tại nút mang.
 *
 * `idPrefix` tách không gian `id` của bản trong khung khỏi mọi `id` sẵn có của màn chi tiết — màn
 * ấy đã có `khoi-so-lieu`, `khoi-ket-qua`, `khoi-vi-du`. Để trống là dùng neo trần, đúng thứ trang
 * đầy đủ cần cho URL.
 */
export function GuideMuc({
  bai,
  muc,
  idPrefix = '',
}: {
  bai: BaiHuongDan;
  muc: MucId;
  idPrefix?: string;
}) {
  const neo = `${idPrefix}${muc}`;

  return (
    <section id={neo} className={styles.section} aria-labelledby={`tieu-de-${neo}`}>
      <h2 className={styles.sectionTitle} id={`tieu-de-${neo}`}>
        <T k={TIEU_DE[muc]} />
      </h2>

      {muc === 'nhap-so' && <KhoiNhapSo bai={bai} />}
      {muc === 'doc-ket-qua' && <KhoiDocKetQua bai={bai} />}
      {muc === 'doc-bieu-do' && <KhoiBieuDo bai={bai} />}
      {muc === 'ket-qua-trong' && <KhoiKetQuaTrong bai={bai} />}
    </section>
  );
}

/**
 * Cả bài — chỉ là `mucCo` map qua `<GuideMuc>`.
 *
 * Không một dòng nào ở đây biết một mục trông ra sao, và đó là điểm: "khung nói giống bài" thành
 * một sự thật của cấu trúc, không còn là lời hứa phải nhớ giữ.
 */
export function GuideBody({ bai, idPrefix = '' }: { bai: BaiHuongDan; idPrefix?: string }) {
  return (
    <article className={styles.article}>
      {bai.mucCo.map((muc) => (
        <GuideMuc key={muc} bai={bai} muc={muc} idPrefix={idPrefix} />
      ))}
    </article>
  );
}

/**
 * Mục "Lấy số liệu ở đâu" — MỘT HÀNG CHO MỖI Ô NHẬP, và không gì khác.
 *
 * Trước 05/10/2026 mục này còn mang bốn thẻ "đường nạp số", câu khoá ô khi đã nạp mã, câu số phiên
 * tối thiểu, câu chế độ Nâng cao kèm hai link, danh sách ô nhận số từ công thức khác, link đổi
 * biểu phí, và một câu chỉ đường tới Bảng biến. Chín thứ, tất cả là chữ dùng chung tả lại màn.
 * Chúng đi theo lời chốt của chủ dự án; mộ chí của những cờ từng bật tắt chúng ở
 * `src/core/huong-dan/types.ts`.
 *
 * ── KHÔNG có `<h3>` nhãn khối ở đây, và đó là một quyết định ─────────────────────────────────
 *
 * Mục này từng in `<h3>` 'LẤY SỐ Ở ĐÂU' ngay dưới `<h2>` 'Nhập số vào đâu' của chính nó. Hai
 * tiêu đề nói cùng một việc, xếp liền nhau, trước khi tới hàng ô nhập đầu tiên. Chủ dự án chỉ
 * thẳng vào tiêu đề trên và gọi nó là "text dư" (05/10/2026), rồi ở cùng lượt đổi tên tiêu đề
 * dưới thành 'Lấy số liệu ở đâu' — hai chỉ dẫn ấy chỉ ăn khớp theo một cách: còn MỘT tiêu đề,
 * mang tên mới, và nó phải là `<h2>` vì mục lục đọc nó và `aria-labelledby` trỏ vào nó.
 *
 * Đừng thêm `<h3>` trở lại. `KhoiBieuDo` có `<h3>` là chuyện khác: nhãn ở đó gọi tên LOẠI biểu đồ
 * công thức này đang vẽ, tức một thông tin `<h2>` 'Đọc biểu đồ' không nói.
 *
 * `<dl>` chứ `<ul>`: mỗi hàng là một CẶP tên ô → nơi lấy số liệu, và đó đúng là thứ `<dl>` dựng.
 */
function KhoiNhapSo({ bai }: { bai: BaiHuongDan }) {
  if (bai.rieng === undefined || bai.rieng.oNhap.length === 0) return null;

  return (
    <dl className={styles.fieldSources}>
      {bai.rieng.oNhap.map((o) => (
        <HangONhap key={o.key} o={o} />
      ))}
    </dl>
  );
}

/** Một ô: tên ô ở trên, nơi lấy số ở dưới, lưu ý (nếu có) đóng hàng. */
function HangONhap({ o }: { o: ONhapHuongDan }) {
  return (
    <div className={styles.fieldRow}>
      <dt className={styles.fieldLabel}>
        <Pick value={o.nhan} />
        {/*
          Dấu Nâng cao chỉ in ở 12/269 ô, và nó là NGOẠI LỆ DUY NHẤT của luật "chỉ chữ trong file":
          hai chữ này không có trong `guide-111.json`.

          Giữ nó có chủ ý, và lý do là một lỗi đã trả giá: thiếu dấu ấy thì bài kê một ô mà người
          đọc ở chế độ Cơ bản không tìm thấy trên màn — đúng hình dạng của lỗi đợt 5 (bài dạy 38
          công thức bấm nút "Nạp mẫu" không có trên màn của họ). Nó cũng không phải một CÂU: nó là
          một nhãn trạng thái cạnh tên ô, cùng loại với thẻ "Cơ bản" ở tiêu đề màn tính.
        */}
        {o.nangCao && (
          <span className={styles.fieldAdvanced}>
            <T k="guide.input.advancedField" />
          </span>
        )}
      </dt>
      <dd className={styles.fieldWhere}>
        <Pick value={o.layODau} />
        {o.luuY !== undefined && (
          <span className={styles.fieldNote}>
            <Pick value={o.luuY} />
          </span>
        )}
      </dd>
    </div>
  );
}

/**
 * Mục "Đọc kết quả" — hai câu, cả hai của chủ dự án.
 *
 * `docKetQua` mở mục, `deSai` đóng mục. Bốn bước "làm gì tiếp" (xem ví dụ · làm bài tập · lưu ·
 * xuất file) đã BỎ ngày 05/10/2026 cùng hai link của chúng: bốn bước ấy kể tên bốn khối người đọc
 * đang nhìn thấy, không bước nào nói con số nghĩa là gì.
 *
 * Cả hai câu gần `explanation.howToRead` và `commonMistakes` của khối "Giải thích cho người mới",
 * nên mục này cố ý KHÔNG có nút "?" nào mở: trên trang đầy đủ không có khối Giải thích để mà trùng.
 */
function KhoiDocKetQua({ bai }: { bai: BaiHuongDan }) {
  if (bai.rieng === undefined) return null;

  return (
    <>
      <p className={styles.prose}>
        <Pick value={bai.rieng.docKetQua} />
      </p>

      {/*
        "Dễ sai" mang MỘT lỗi chứ không phải một danh sách — luật của chính tài liệu. Đo trên `pe`:
        nó KHÁC `explanation.commonMistakes` (tài liệu nói lỗi thao tác "lấy EPS một quý đọc như cả
        năm", Registry nói lỗi khái niệm "so P/E giữa hai ngành"), nên đây là chữ bổ sung chứ không
        phải bản sao.
      */}
      <p className={styles.caution}>
        <span className={styles.cautionLabel}>
          <T k="guide.result.pitfall" />
        </span>
        <Pick value={bai.rieng.deSai} />
      </p>
    </>
  );
}

/**
 * Mục "Đọc biểu đồ" — MỘT đoạn, chọn theo LOẠI biểu đồ công thức đang vẽ.
 *
 * Chỉ có ở 102 công thức; 9 công thức `chartType: 'none'` không dựng khối biểu đồ nên bài của
 * chúng không có mục này.
 *
 * Trước 05/10/2026 mục này in bảy bước dùng chung, ba trong số đó bật tắt theo cờ. Bảy bước ấy nói
 * cho MỌI loại hình, nên không bước nào nói đúng hình đang vẽ: một đoạn về biểu đồ quét độ nhạy
 * không có nghĩa gì với người đang nhìn biểu đồ nến. `guide-111.json` viết một đoạn riêng cho mỗi
 * loại, và đó là lý do khối này gọn đi mà nói được nhiều hơn.
 */
function KhoiBieuDo({ bai }: { bai: BaiHuongDan }) {
  if (bai.kieuBieuDo === undefined || bai.kieuBieuDo === 'none') return null;
  const chu = CHU_BIEU_DO[bai.kieuBieuDo];

  return (
    <div className={styles.noiDung}>
      <h3 className={styles.blockLabel}>
        <T k={chu.tieuDe} />
      </h3>
      <p className={styles.prose}>
        <T k={chu.than} />
      </p>
    </div>
  );
}

/**
 * Mục "Khi kết quả hiện _ _" — một câu cho mỗi MÃ cảnh báo công thức phát ra được.
 *
 * Mã nào có mặt thì do CHẠY `calc` thật quyết định (`caKetQuaTrong`), còn câu thì của chủ dự án.
 * Trước 05/10/2026 mục này in nguyên câu `calc` viết kèm dòng "cách sửa" của nó; hai nguồn cùng
 * nói một việc là đúng thứ đợt này đi bỏ.
 *
 * Vẫn dựng bằng `InlineWarning` chứ một danh sách thường, và đó không phải thẩm mỹ: người đọc phải
 * thấy ở đây CHÍNH cái thẻ họ sẽ gặp trên màn tính, kèm đúng nhãn mã ấy. Không truyền `fix` —
 * trường ấy tuỳ chọn, và câu trong file đã nói luôn cách sửa.
 */
function KhoiKetQuaTrong({ bai }: { bai: BaiHuongDan }) {
  return (
    <div className={styles.warnings}>
      {bai.ketQuaTrong.map((ma) => (
        <GuideWarning key={ma} ma={ma} />
      ))}
    </div>
  );
}

/*
 * ── Mộ chí: `Buoc`, `LoiRa`, `TuCongThuc`, `NAP_SO`, `tenCongThuc`, prop `onRoiBai` ─────────
 *
 * Năm hàm dựng và một prop, bỏ ngày 05/10/2026 cùng những câu chúng in.
 *
 * `LoiRa` đáng ghi lại dài nhất vì nó mang một bài học đắt. Nó gắn `onClick` CHỈ khi thật sự có
 * `onRoiBai`, và đó là điều kiện bắt buộc chứ không phải viết cho gọn: thân bài dựng được ở CẢ HAI
 * phía, mà `next/link` là client component, nên truyền một hàm từ server component sang nó là lỗi
 * dựng và trang `/huong-dan/cong-thuc/<id>/` trả HTTP 500. Bẫy nằm ở chỗ `() => onRoiBai?.()` viết
 * thẳng vào JSX vẫn là một hàm MỚI ở mọi lượt dựng, kể cả khi `onRoiBai` là `undefined`. Lỗi ấy
 * sống từ đợt 2 tới đợt 5 mà không ca kiểm nào thấy, vì `GuideScreen.test.tsx` chạy trong jsdom —
 * tức dựng ở phía client.
 *
 * `onRoiBai` (hàm đóng khung trước khi đi theo một link trỏ về chính màn đang bị khung che) đi
 * theo, vì thân bài không còn link nào. `GuideHintPanel` vì thế thôi truyền nó.
 *
 * Nếu sau này bài có link trở lại: đọc lại đoạn trên TRƯỚC KHI viết dòng JSX đầu tiên.
 */
