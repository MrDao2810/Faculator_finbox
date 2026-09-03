/**
 * Tầng APPLICATION — nhớ **mã cổ phiếu người dùng đang xem** trong suốt một lượt duyệt.
 *
 * ## Vì sao cần
 *
 * Trước module này, mã chỉ sống trong `useState` của một màn chi tiết: nạp `?ma=HPG`, xem P/E
 * xong, mở tiếp P/B là ô nhập về bộ mặc định và phải nạp lại từ đầu. Người dùng thật không xem
 * *một chỉ số của một mã* — họ xem *một mã qua nhiều chỉ số*, nên việc nạp lại lặp lại đúng bằng
 * số công thức họ muốn xem.
 *
 * ## Vì sao cất cả `Preset` chứ không chỉ cất mã
 *
 * Cất mỗi mã thì mỗi lần mở một công thức khác lại là một lời gọi tới `dcs.finbox.vn` cho **cùng
 * một mã, cùng một phiên** — xem 5 chỉ số là 5 request giống hệt nhau. Cất luôn `Preset` đã dựng
 * thì cả lượt duyệt chỉ tốn một lời gọi, và các màn sau nạp tức thì, không cần mạng.
 *
 * Preset ở đây nhỏ: API Finbox chỉ trả **một phiên** giá (xem `presetFromSnapshot`), nên `bars`
 * có đúng một phần tử — vài trăm byte, không phải 248 phiên như bộ mẫu tĩnh.
 *
 * ## Vì sao `sessionStorage` chứ không `localStorage`
 *
 * Đây là ngữ cảnh của MỘT lượt duyệt, không phải tuỳ chọn — cùng lý do `last-list-url.ts` chọn
 * `sessionStorage`. Và nó còn là **điều kiện để việc cất giá không thành nói dối**: giá cổ phiếu
 * cũ đi theo giờ, mà một bản cất trong `localStorage` sẽ sống qua đêm rồi âm thầm điền số của
 * hôm qua vào ô nhập hôm nay. Đóng tab là mất — đúng tuổi thọ của một phiên làm việc.
 *
 * Kèm theo đó, màn **phải nói ra** là đang dùng số liệu của mã nào (`fundamentalsAsOf` của preset
 * cho biết số liệu cơ bản đối chiếu lúc nào). Cặp ràng buộc này giống hệt cặp mà
 * `price-cache-store.ts` phải giữ với `PriceState = 'stale'`: được dùng số đã cất, nhưng phải
 * gọi tên được nguồn gốc của nó.
 *
 * Phần thuần nằm ở đây, không import React — test được bằng Node. Phần chạm `sessionStorage` do
 * màn gọi trong `useEffect`, cùng khuôn `price-series-store.ts`.
 */

import { PRESET_CONTRACT_VERSION } from '@/data';
import type { Preset } from '@/data';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const ACTIVE_TICKER_KEY = 'ffb.activeTicker.v1';

/**
 * Dạng mã hợp lệ. Mã dài nhất đang giao dịch là 8 ký tự (E1VFVN30); nới tới 12 cho chứng quyền.
 *
 * Soi ở ĐÂY chứ không chỉ ở nơi gọi: nội dung `sessionStorage` người dùng sửa được, và mã đọc
 * lên từ đó đi thẳng vào một lời gọi mạng.
 */
const CODE_SHAPE = /^[A-Z0-9]{3,12}$/;

/** Mã đang xem, kèm bộ số liệu đã dựng cho nó. */
export interface ActiveTicker {
  code: string;
  preset: Preset;
}

/** Số hữu hạn hay `null`. Thứ gì khác đều thành `null` chứ không thành 0. */
function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Đọc lại `Fundamentals` từ JSON.
 *
 * Sáu trường số đều **bắt buộc** ở kiểu gốc, nên thiếu một trường là **bỏ cả bản cất** chứ không
 * điền 0 vào chỗ trống. Một `eps` bằng 0 lọt vào sẽ cho P/E vô cực rồi rơi về `fail`, còn một
 * `sharesOutstanding` bằng 0 thì kéo vốn hoá về 0 mà trông vẫn như một con số thật — đúng loại
 * sai mà FR-06 sinh ra để chặn, và lần này ở nơi người dùng không thấy nguyên nhân.
 */
function readFundamentals(value: unknown): Preset['fundamentals'] | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  const eps = numberOrNull(record.eps);
  const bookValuePerShare = numberOrNull(record.bookValuePerShare);
  const sharesOutstanding = numberOrNull(record.sharesOutstanding);
  const dividendPerShare = numberOrNull(record.dividendPerShare);
  const netIncome = numberOrNull(record.netIncome);
  const equity = numberOrNull(record.equity);

  if (
    eps === null ||
    bookValuePerShare === null ||
    sharesOutstanding === null ||
    dividendPerShare === null ||
    netIncome === null ||
    equity === null
  ) {
    return null;
  }

  return {
    eps,
    bookValuePerShare,
    sharesOutstanding,
    dividendPerShare,
    netIncome,
    equity,
    period: typeof record.period === 'string' ? record.period.slice(0, 40) : '',
  };
}

/** Đọc lại chuỗi phiên. Phiên thiếu giá đóng bị bỏ hẳn — một phiên giá 0 làm hỏng mọi phép chia. */
function readBars(value: unknown): Preset['bars'] {
  if (!Array.isArray(value)) return [];

  const bars: Array<Preset['bars'][number]> = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;

    const close = numberOrNull(record.close);
    if (close === null || close <= 0) continue;

    // Bốn trường quanh giá đóng là `number | null` ở kiểu gốc, và `presetFromSnapshot()` vốn để
    // chúng `null` (API chỉ trả giá đóng) — nên giữ nguyên `null` thay vì bịa giá mở bằng giá đóng.
    bars.push({
      date: typeof record.date === 'string' ? record.date.slice(0, 20) : '',
      open: numberOrNull(record.open),
      high: numberOrNull(record.high),
      low: numberOrNull(record.low),
      close,
      volume: numberOrNull(record.volume),
    });
  }
  return bars;
}

/**
 * Đọc mã đang xem từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném, và trả `null` cho mọi ca đáng ngờ: mã sai dạng, thiếu số liệu cơ bản, hay
 * chuỗi hỏng. `null` nghĩa là "chưa có mã nào" — màn cứ chạy như trước, không có gì để bày.
 */
export function parseActiveTicker(raw: string | null | undefined): ActiveTicker | null {
  if (raw === null || raw === undefined || raw.trim() === '') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;

  const code = typeof record.code === 'string' ? record.code.trim().toUpperCase() : '';
  if (!CODE_SHAPE.test(code)) return null;

  if (typeof record.preset !== 'object' || record.preset === null) return null;
  const source = record.preset as Record<string, unknown>;

  const fundamentals = readFundamentals(source.fundamentals);
  // Không có số liệu cơ bản thì preset chẳng điền được ô nào — coi như chưa có mã nào.
  if (fundamentals === null) return null;

  const presetCode = typeof source.code === 'string' ? source.code.trim().toUpperCase() : '';
  // Hai mã lệch nhau nghĩa là bản cất đã hỏng; nạp vào sẽ điền số của mã này dưới tên mã kia.
  if (presetCode !== code) return null;

  /*
   * Phiên bản hợp đồng (SW-05 · LDR-05). Đây là chỗ phép kiểm ấy đáng giá nhất trong cả sản phẩm:
   * bản cất nằm trong `sessionStorage` của người dùng, nên nó có thể do một BẢN CŨ của trang ghi
   * ra rồi sống sót qua lần cập nhật. Bản ghi thiếu trường này là bản ghi trước khi hợp đồng có
   * phiên bản, và cách xử đúng vẫn là cách file này dùng cho mọi ca đáng ngờ: bỏ qua, coi như
   * chưa có mã nào — chứ không nạp một hình dạng cũ vào công thức rồi đoán phần thiếu.
   */
  if (source.version !== PRESET_CONTRACT_VERSION) return null;

  const asOf = typeof source.fundamentalsAsOf === 'string' ? source.fundamentalsAsOf.trim() : '';

  return {
    code,
    preset: {
      version: PRESET_CONTRACT_VERSION,
      code,
      name: typeof source.name === 'string' ? source.name.trim().slice(0, 80) : code,
      meta: typeof source.meta === 'string' ? source.meta.trim().slice(0, 120) : '',
      fundamentals,
      bars: readBars(source.bars),
      // Số liệu đến từ API là số thật, không phải bộ mẫu tự dựng — nhưng nếu bản cất nói khác
      // thì tin nó, vì nhãn BẢN THẢO chỉ được phép thừa ra chứ không được phép thiếu.
      isDraft: source.isDraft === true,
      ...(asOf === '' ? {} : { fundamentalsAsOf: asOf }),
    },
  };
}

/** Chuỗi JSON để ghi vào `sessionStorage`. */
export function serializeActiveTicker(active: ActiveTicker): string {
  return JSON.stringify({ code: active.code.trim().toUpperCase(), preset: active.preset });
}

/** Mã có đúng dạng để đem đi tra hay không — dùng chung cho `?ma=` và cho mã đọc từ kho. */
export function isTickerCode(value: string): boolean {
  return CODE_SHAPE.test(value.trim().toUpperCase());
}
