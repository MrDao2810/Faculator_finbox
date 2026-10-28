import { dienCau, fillRepeat, repeatIndexIn } from '@/application';
import type {
  BaiHuongDan,
  Bilingual,
  HinhDangXem,
  KhoiBieuDoBai,
  KhoiLapBai,
  MessageKey,
  MucId,
  ONhapHuongDan,
  ThongSoO,
} from '@/application';
import { Pick } from '@/ui/i18n/Pick';
import { T } from '@/ui/i18n/T';

import { GuideWarning } from './GuideWarning';
import styles from './GuideBody.module.css';

/**
 * Thân bài "Hướng dẫn sử dụng" — bốn mục, dùng CHUNG cho trang đầy đủ và cho khung mở tại nút
 * (WF-21, đợt 2 — 02/10/2026; nội dung viết lại ở đợt 5, rồi thay hẳn ở đợt 8 — 05/10/2026).
 *
 * ── Bài CHỈ mang chữ chủ dự án giao — trừ mục "Đọc biểu đồ" ──────────────────────────────────
 *
 * Đây là luật mạnh nhất của file, và nó là lời chốt của chủ dự án ngày 05/10/2026: *"câu thừa
 * trước đó thì bỏ đi, chỉ để lại những câu đã tạo trong file tôi gửi thôi"*. Chữ của BA mục và dải
 * mở đầu phải truy được về `guide-111.json`:
 *
 * | Mục              | In gì                            | Khoá trong file                |
 * | ---------------- | -------------------------------- | ------------------------------ |
 * | dải mở đầu trang | `deLamGi`                        | `formulas[id].purpose`         |
 * | `#nhap-so`       | một hàng mỗi ô nhập              | `variables[id][key].where/hint`|
 * | `#doc-ket-qua`   | `docKetQua` rồi `deSai`          | `.read` · `.pitfall`           |
 * | `#ket-qua-trong` | một câu mỗi mã cảnh báo          | `warnings[code]`               |
 *
 * Mục `#doc-bieu-do` là NGOẠI LỆ, và là ngoại lệ do chính chủ dự án mở ngày 13/10/2026: chín đoạn
 * `charts[kind]` của file ấy tả LOẠI hình khai trong Registry chứ không tả hình màn tính thật sự
 * vẽ, và chủ dự án yêu cầu viết lại cho từng công thức. Chữ của mục này nay nằm ở
 * `src/core/huong-dan/bieu-do/noi-dung/`, do người viết code viết và có cửa kiểm riêng
 * (`bieuDoProblems()`).
 *
 * Đợt 5 có thêm một mục `#hieu-cong-thuc` và khoảng hai mươi câu thao tác dùng chung (bốn đường
 * nạp số, câu số phiên tối thiểu, câu chế độ Nâng cao, câu hằng số, bốn bước "làm gì tiếp", bảy
 * bước đọc biểu đồ). Tất cả đã đi. Lý do không phải chúng sai — phần lớn đúng và đã soi trên màn
 * thật — mà là chúng TẢ LẠI thứ màn đã bày, đúng loại chữ chủ dự án đã gọi tên ở đợt 5 ("Mức phí
 * và thuế đang hiệu lực do sản phẩm tự tra…") và nay chốt bỏ hết.
 *
 * Hệ quả cấu trúc, và nó là cách giữ luật này không trôi: ở ba mục kia **`<T>` chỉ in tiêu đề mục
 * và nhãn khối, không in NỘI DUNG**. Thêm một `<T k="guide.…">` mang câu chữ vào đó là đang dựng lại
 * thứ vừa gỡ. Mục "Đọc biểu đồ" có thêm ba `<T>`: hai nhãn dạng và một dòng cho hình chỉ vẽ được
 * khi đã nạp chuỗi giá. Hai câu chỉ tới dòng "Xem kết quả đổi theo" / "Loại biểu đồ" từng đóng mục
 * này đã bỏ theo lời chủ dự án (13/10/2026) — xem `KhoiBieuDo`.
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

/*
 * ── Mộ chí: hai bảng từng đứng ở đây ────────────────────────────────────────────────────────
 *
 * `CHU_BIEU_DO` (05/10 – 12/10/2026) ánh xạ `ChartType` sang chín đoạn dùng chung, tiêu đề là tên
 * LOẠI ("Biểu đồ quét độ nhạy"…). Nó đi ngày 13/10/2026: xem `src/core/huong-dan/bieu-do/types.ts`
 * và mộ chí `guide.chartKind.*` ở `vi.ts`.
 *
 * `DIEU_KIEN` thay nó được vài giờ: bốn dòng "hình này hiện ra lúc nào" (ở chế độ Nâng cao · thay
 * cho hình trên khi đã nạp chuỗi giá · chỉ vẽ sau khi nạp chuỗi giá · hiện ra khi chọn Bóc tách),
 * in dưới tên từng hình khi khung "?" còn bày mọi hình cạnh nhau. Khung nay chỉ in hình ĐANG HIỆN,
 * nên ba trong bốn dòng không còn gì để nói; dòng còn lại (`guide.chart.when.seriesOnly`) gọi thẳng
 * ở `NoiDungHinh`, không cần bảng.
 */

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
 *
 * `hinh` chỉ mục "Đọc biểu đồ" đọc, và nó là chỗ khung với trang KHÁC nhau có chủ ý — xem
 * `KhoiBieuDo`. Khung truyền hình đang hiện trên màn tính (hoặc `null` khi khối Biểu đồ chưa kịp
 * báo); trang đầy đủ không truyền gì, vì ở đó không có biểu đồ nào đang hiện.
 *
 * `giaTri` cùng một nếp, cho mục "Lấy số liệu ở đâu": khung truyền bộ số đang có trong các ô để
 * câu "{sessions} phiên là khoảng …" in đúng số người dùng đang nhìn (14/10/2026); trang đầy đủ
 * không truyền, và câu điền bằng mặc định. Xem `@/core/huong-dan/noi-dung/cho-trong.ts`.
 */
export function GuideMuc({
  bai,
  muc,
  idPrefix = '',
  hinh,
  giaTri,
  onTroO,
}: {
  bai: BaiHuongDan;
  muc: MucId;
  idPrefix?: string;
  hinh?: HinhDangXem | null;
  giaTri?: Readonly<Record<string, number>>;
  /**
   * Báo ô nào đang được rê vào ở mục "Lấy số liệu ở đâu" (`null` khi rời ra), để màn tính tô sáng
   * ký hiệu của ô ấy ở thẻ Công thức (28/10/2026). Trang đầy đủ không có thẻ ấy nên không truyền.
   */
  onTroO?: (key: string | null) => void;
}) {
  const neo = `${idPrefix}${muc}`;

  return (
    <section id={neo} className={styles.section} aria-labelledby={`tieu-de-${neo}`}>
      <h2 className={styles.sectionTitle} id={`tieu-de-${neo}`}>
        <T k={TIEU_DE[muc]} />
      </h2>

      {muc === 'nhap-so' && <KhoiNhapSo bai={bai} giaTri={giaTri} onTroO={onTroO} />}
      {muc === 'doc-ket-qua' && <KhoiDocKetQua bai={bai} />}
      {muc === 'doc-bieu-do' && <KhoiBieuDo bai={bai} hinh={hinh} />}
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
function KhoiNhapSo({
  bai,
  giaTri,
  onTroO,
}: {
  bai: BaiHuongDan;
  giaTri: Readonly<Record<string, number>> | undefined;
  onTroO: ((key: string | null) => void) | undefined;
}) {
  if (bai.rieng === undefined || bai.rieng.oNhap.length === 0) return null;

  return (
    <dl className={styles.fieldSources}>
      {bai.rieng.oNhap.map((o) => (
        <HangONhap key={o.key} o={o} thongSo={bai.thongSo} giaTri={giaTri} onTroO={onTroO} />
      ))}
    </dl>
  );
}

/**
 * Một ô: tên ô ở trên, nơi lấy số ở dưới, lưu ý (nếu có) đóng hàng.
 *
 * Hai câu đi qua `dienCau` trước khi in: câu không có chỗ trống thì ra y nguyên, câu có thì nhận
 * số đang có trong ô (khung "?") hoặc số mặc định (trang đầy đủ). Điền CẢ HAI ngôn ngữ, vì `<Pick>`
 * chọn sau.
 */
function HangONhap({
  o,
  thongSo,
  giaTri,
  onTroO,
}: {
  o: ONhapHuongDan;
  thongSo: Readonly<Record<string, ThongSoO>>;
  giaTri: Readonly<Record<string, number>> | undefined;
  onTroO: ((key: string | null) => void) | undefined;
}) {
  const dien = (cau: Bilingual): Bilingual => ({
    vi: dienCau(cau.vi, thongSo, giaTri),
    en: dienCau(cau.en, thongSo, giaTri, 'en'),
  });

  return (
    /*
     * Rê vào CẢ HÀNG (tên ô lẫn câu bên dưới) là đang đọc về ô ấy, nên ký hiệu của nó sáng lên ở thẻ
     * Công thức — `onTroO`, xem `GuideMuc`. Không làm hàng thành nút, không điểm Tab: đây là lối tắt
     * cho mắt, chữ trong hàng đọc được đủ mà không cần nó.
     */
    <div
      className={styles.fieldRow}
      onPointerEnter={onTroO === undefined ? undefined : () => onTroO(o.key)}
      onPointerLeave={onTroO === undefined ? undefined : () => onTroO(null)}
    >
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
        <Pick value={dien(o.layODau)} />
        {o.luuY !== undefined && (
          <span className={styles.fieldNote}>
            <Pick value={dien(o.luuY)} />
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

/** Khối chữ của một ô do người dùng thêm, dựng từ khối mẫu bằng cách điền số thứ tự nhóm. */
function khoiTuMau(khoiLap: ReadonlyArray<KhoiLapBai>, khoa: string): KhoiBieuDoBai | undefined {
  for (const mau of khoiLap) {
    const n = repeatIndexIn(mau.tienTo, khoa);
    if (n === null) continue;
    return {
      khoa,
      ten: fillRepeat(mau.ten, n),
      duong: fillRepeat(mau.duong, n),
      ...(mau.cot === undefined ? {} : { cot: fillRepeat(mau.cot, n) }),
      nangCao: mau.nangCao,
      // Ô của nhóm thêm là ô số thường: hình của nó vẽ được ngay, không chờ chuỗi giá.
      canChuoi: false,
    };
  }
  return undefined;
}

/**
 * Khối của hình ĐANG HIỆN trên màn tính và dạng đang vẽ — thứ khung "?" in.
 *
 * Tra bằng `KhoiBieuDoBai.khoa`, tức chính `ChartModel.sweepKey` mà khối Biểu đồ báo lên. Ba ca rơi
 * về khối ĐẦU (hình màn mở ra): khối Biểu đồ chưa kịp báo (`hinh === null` — chunk biểu đồ nạp trễ),
 * màn chưa vẽ gì và người dùng chưa chọn mục nào (`khoa === null`), và một khoá không có khối chữ.
 * Ca cuối không xảy ra trong thư viện hiện tại — `bieu-do.test.ts` đòi mọi mục của ô chọn đều có khối
 * — nên nó chỉ là lưới an toàn: thà nói về hình mặc định còn hơn để khung trống.
 *
 * `chuaVe` quyết định dòng "Chỉ vẽ sau khi đã nạp…": nó chỉ đáng in khi hình đang được tả CHƯA có
 * trên màn. Hình đã vẽ rồi mà còn in dòng ấy là nói một điều người đọc đang thấy là sai.
 *
 * ── Hình của một ô do người dùng THÊM (13/10/2026) ───────────────────────────────────────────
 *
 * Hai công thức cho thêm đợt mua / thêm kỳ, và ô chọn trục có ngay mục "Giá mua đợt 4". Ô ấy không
 * có khối riêng (lúc build chưa ai biết sẽ có mấy đợt), nên trước khi rơi về khối đầu, phép chọn
 * thử các khối MẪU (`khoiLap`): khoá là tiền tố của mẫu cộng một số thì lấy mẫu ấy và điền số vào
 * `{n}`. Không có bước này thì khung nói về "…theo Giá mua đợt 3" cạnh một hình của đợt 4.
 *
 * Xuất ra để ca kiểm gọi thẳng; nó là phép chọn thuần, không đụng tới DOM.
 */
export function khoiDangXem(
  khoi: ReadonlyArray<KhoiBieuDoBai>,
  hinh: HinhDangXem | null,
  khoiLap: ReadonlyArray<KhoiLapBai> = [],
): { khoi: KhoiBieuDoBai; dang: 'duong' | 'cot'; chuaVe: boolean } | undefined {
  const dau = khoi[0];
  if (dau === undefined) return undefined;
  /* Hình theo chuỗi giá chưa có chữ: im lặng chứ không in đoạn của hình khác (xem `HinhDangXem.hinhChuoi`). */
  if (hinh?.hinhChuoi === true) return undefined;

  const khoa = hinh?.khoa ?? null;
  const dangHien =
    khoa === null ? undefined : (khoi.find((mot) => mot.khoa === khoa) ?? khoiTuMau(khoiLap, khoa));
  const chon = dangHien ?? dau;

  return {
    khoi: chon,
    // Xin dạng Cột cho một hình không có dạng ấy thì in dạng Đường — màn cũng vẽ đúng như thế.
    dang: hinh?.dang === 'cot' && chon.cot !== undefined ? 'cot' : 'duong',
    chuaVe: hinh === null || !hinh.daVe,
  };
}

/**
 * Mục "Đọc biểu đồ" — chữ viết riêng cho từng HÌNH màn tính của công thức này dựng được.
 *
 * Chỉ có ở 103 công thức; 8 công thức `chartType: 'none'` không dựng khối biểu đồ nên bài của chúng
 * không có mục này.
 *
 * ── Khung "?" chỉ in hình ĐANG HIỆN, ở dạng đang chọn (13/10/2026) ───────────────────────────
 *
 * Bản đầu in mọi hình của công thức, mỗi hình hai dạng, rồi đóng bằng hai câu chỉ tới dòng "Xem kết
 * quả đổi theo" và dòng "Loại biểu đồ". Chủ dự án xem khung ấy và chốt: bỏ hai câu, và *"ô hướng dẫn
 * sử dụng đang rất dài, sửa logic như sau: sau khi lựa chọn một select mới từ đường thì mới hiển thị
 * xem biểu đồ dạng đường, tương tự khi click vào xem biểu đồ dạng cột. hoặc khi đổi dạng Xem theo
 * thời gian, Khối lượng, thời gian nắm giữ,... với tất cả các loại biểu đồ của tất cả công thức"*.
 *
 * Nên khi có `hinh`, mục in ĐÚNG MỘT khối: tên của hình đang hiện — đúng chữ màn tính in dưới hình —
 * rồi đúng một đoạn, của dạng đang vẽ. Đổi mục ở ô chọn hay bấm nút Đường/Cột rồi mở lại "?" là ra
 * đoạn khác. Hai câu chỉ đường không còn việc gì: chính màn làm việc "chọn gì thì chữ theo nấy".
 *
 * ── Trang đầy đủ không có biểu đồ nào đang hiện, nên nó xếp MỌI hình thành mục gập ────────────
 *
 * Không có `hinh` (trang `/huong-dan/cong-thuc/<id>/`) thì không có "hình đang hiện" để lọc theo.
 * In hết ra như bản đầu là dựng lại đúng cái khung dài vừa bị chê, mà giờ còn dài hơn: mỗi ô nhập
 * đứng được trên trục ngang đã có chữ riêng, tới sáu hình một công thức. Nên mỗi hình là một
 * `<details>`, tên hình làm `<summary>`, hình màn mở ra thì mở sẵn — "chọn rồi mới hiện" bằng thẻ
 * gốc, bấm được cả khi JS chưa tải, và chữ vẫn nằm trọn trong HTML tĩnh.
 *
 * Tên hình là `<h3>` nằm TRONG `<summary>` chứ không thay nó: mục lục của trình đọc màn hình vẫn
 * đi được qua từng hình dù mục đang gập.
 *
 * Lịch sử, để không ai dựng lại: bảy bước dùng chung (tới 05/10/2026) → một đoạn cho mỗi LOẠI khai
 * trong Registry (tới 12/10/2026, tiêu đề "Biểu đồ quét độ nhạy"…) → mọi hình thật in cùng lúc kèm
 * hai câu chỉ đường (sáng 13/10/2026) → từng hình, theo lựa chọn đang có trên màn.
 */
function KhoiBieuDo({ bai, hinh }: { bai: BaiHuongDan; hinh: HinhDangXem | null | undefined }) {
  if (bai.bieuDo === undefined) return null;
  const { khoi, khoiLap } = bai.bieuDo;

  if (hinh !== undefined) {
    const xem = khoiDangXem(khoi, hinh, khoiLap);
    if (xem === undefined) return null;

    return (
      <div className={styles.noiDung}>
        <h3 className={styles.blockLabel}>
          <Pick value={xem.khoi.ten} />
        </h3>
        <NoiDungHinh khoi={xem.khoi} dang={xem.dang} chuaVe={xem.chuaVe} />
      </div>
    );
  }

  return (
    <div className={styles.charts}>
      {khoi.map((mot, i) => (
        <details key={mot.khoa} className={styles.chartItem} open={i === 0}>
          <summary className={styles.chartSummary}>
            <h3 className={styles.blockLabel}>
              <Pick value={mot.ten} />
            </h3>
            {/* Cùng dấu, cùng lý do với ô nhập ở mục "Lấy số liệu ở đâu": mục này của ô chọn chỉ
                có ở chế độ Nâng cao, và bài không được kê một lựa chọn người đọc không tìm thấy. */}
            {mot.nangCao && (
              <span className={styles.fieldAdvanced}>
                <T k="guide.input.advancedField" />
              </span>
            )}
          </summary>
          <div className={styles.chartBody}>
            <NoiDungHinh khoi={mot} dang={undefined} chuaVe />
          </div>
        </details>
      ))}
    </div>
  );
}

/**
 * Chữ của MỘT hình: dòng điều kiện (nếu hình chưa có trên màn), rồi đoạn của hình bóc tách hoặc
 * từng dạng của hình đường.
 *
 * `dang` có giá trị là chỉ in dạng ấy — khung "?" theo đúng nút đang bấm ở dòng "Loại biểu đồ".
 * `undefined` là in cả hai, cho trang đầy đủ. Nhãn dạng vẫn in cả khi chỉ còn một dạng: nó nói đoạn
 * chữ đang tả dạng nào, và trùng với chữ của nút đang bấm.
 *
 * `<dl>` cho cặp "dạng → cách đọc", cùng khuôn và cùng lớp với `KhoiNhapSo`: hai mục liền nhau của
 * một bài mà xếp chữ hai kiểu là thứ mắt bắt được trước cả khi đọc.
 */
function NoiDungHinh({
  khoi,
  dang,
  chuaVe,
}: {
  khoi: KhoiBieuDoBai;
  dang: 'duong' | 'cot' | undefined;
  chuaVe: boolean;
}) {
  const inDuong = khoi.duong !== undefined && dang !== 'cot';
  const inCot = khoi.cot !== undefined && dang !== 'duong';

  return (
    <>
      {khoi.canChuoi && chuaVe && (
        <p className={styles.chartWhen}>
          <T k="guide.chart.when.seriesOnly" />
        </p>
      )}

      {khoi.thanh !== undefined && (
        <p className={styles.prose}>
          <Pick value={khoi.thanh} />
        </p>
      )}

      {(inDuong || inCot) && (
        <dl className={styles.fieldSources}>
          {inDuong && khoi.duong !== undefined && (
            <div className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>
                <T k="guide.chart.line" />
              </dt>
              <dd className={styles.fieldWhere}>
                <Pick value={khoi.duong} />
              </dd>
            </div>
          )}

          {inCot && khoi.cot !== undefined && (
            <div className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>
                <T k="guide.chart.bar" />
              </dt>
              <dd className={styles.fieldWhere}>
                <Pick value={khoi.cot} />
              </dd>
            </div>
          )}
        </dl>
      )}
    </>
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
