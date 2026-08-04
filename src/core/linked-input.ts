/**
 * Tầng DOMAIN — logic ô nhập móc nối (gói WBS 2.3.4).
 *
 * FR-15 đòi bốn điều, và đây là gói đắt nhất toàn dự án đúng vì bốn điều đó chồng lên nhau:
 *   · chỉ rõ biến nào đang nhận giá trị từ công thức khác, kèm TÊN NGUỒN;
 *   · ô nhận tự động phải trông khác ô nhập tay — bằng viền và nhãn chữ, không chỉ bằng màu;
 *   · cho ghi đè thủ công và hoàn tác;
 *   · thượng nguồn lỗi thì hiện cảnh báo kế thừa, KHÔNG âm thầm cho ra số.
 *
 * Phần quyết định trạng thái nằm hết ở đây, thuần TypeScript, để test đủ tổ hợp bằng Node.
 * Component chỉ lo vẽ.
 */

import type { CalcOutput, CalcWarning, VariableSpec } from './types';
import { inheritedFrom } from './warnings';

export type LinkedMode =
  | 'manual' // không có thượng nguồn — ô nhập tay bình thường
  | 'linked' // đang nhận giá trị tự động, chưa ghi đè
  | 'overridden' // người dùng đã ghi đè, giá trị tự động bị bỏ qua
  | 'inheritedError'; // thượng nguồn lỗi và chưa ghi đè (FR-15)

/** Công thức thượng nguồn đang cấp giá trị cho biến này. */
export interface LinkedUpstream {
  /** id công thức thượng nguồn — để nút “Mở …” điều hướng được. */
  formulaId: string;
  /** Nhãn hiện trên giao diện, ví dụ 'CAPM'. */
  label: string;
  /** Kết quả của công thức thượng nguồn, có thể đang lỗi. */
  output: CalcOutput;
}

export interface LinkedArgs {
  spec: VariableSpec;
  /** Không có thượng nguồn thì đây chỉ là ô nhập tay. */
  upstream?: LinkedUpstream;
  /** Giá trị người dùng ghi đè. `undefined` nghĩa là chưa ghi đè. */
  override?: number;
}

export interface LinkedResult {
  mode: LinkedMode;
  /** Giá trị dùng để tính tiếp. `null` nghĩa là chưa có số dùng được (FR-06). */
  value: number | null;
  /** Lý do khi không có số. Chỉ có ở mode 'inheritedError'. */
  warning?: CalcWarning;
  /** Nhãn nguồn để hiện dòng '↳ CAPM'. */
  sourceLabel?: string;
  /** Có hiện nút “Ghi đè” không. */
  canOverride: boolean;
  /** Có hiện nút “Hoàn tác” không. */
  canRevert: boolean;
}

/**
 * Trạng thái hiện tại của một ô móc nối.
 *
 * Điểm quan trọng nhất: **ghi đè thắng cả khi thượng nguồn đang lỗi.** Đó chính là lối thoát
 * mà WF-15 hứa với người dùng ở dòng gợi ý “Mở Beta để sửa · hoặc ghi đè WACC tại đây” —
 * nếu ghi đè mà vẫn kẹt ở cảnh báo kế thừa thì lời hứa đó thành vô nghĩa.
 */
export function resolveLinked(args: LinkedArgs): LinkedResult {
  const { spec, upstream, override } = args;

  // Không móc nối với công thức nào: ô nhập tay thuần.
  if (upstream === undefined) {
    return {
      mode: 'manual',
      value: override ?? spec.defaultValue,
      canOverride: false,
      canRevert: false,
    };
  }

  // Đã ghi đè — thắng mọi thứ, kể cả thượng nguồn đang lỗi.
  if (override !== undefined && Number.isFinite(override)) {
    return {
      mode: 'overridden',
      value: override,
      sourceLabel: upstream.label,
      canOverride: false,
      canRevert: true,
    };
  }

  // Thượng nguồn lỗi và chưa ghi đè: kế thừa cảnh báo, không cho ra số (FR-15).
  if (upstream.output.value === null) {
    return {
      mode: 'inheritedError',
      value: null,
      warning: upstream.output.warning ?? inheritedFrom(upstream.label, spec.label),
      sourceLabel: upstream.label,
      canOverride: true,
      canRevert: false,
    };
  }

  return {
    mode: 'linked',
    value: upstream.output.value,
    sourceLabel: upstream.label,
    canOverride: true,
    canRevert: false,
  };
}

/**
 * Giá trị khởi tạo cho ô khi người dùng bấm “Ghi đè”.
 *
 * Bắt đầu từ con số đang hiển thị chứ không phải ô trống: người bấm Ghi đè thường muốn
 * chỉnh nhẹ giá trị tự động, bắt họ gõ lại từ đầu là bắt làm việc thừa. Thượng nguồn đang
 * lỗi nên không có số nào để lấy thì rơi về `defaultValue` của biến.
 */
export function startOverrideValue(args: LinkedArgs): number {
  const current = resolveLinked(args).value;
  return current ?? args.spec.defaultValue;
}

/**
 * Cảnh báo kế thừa của một ô, hoặc `undefined` nếu ô đang bình thường.
 * Tách riêng để màn hình gom được mọi cảnh báo đang có mà không phải tự đọc `mode`.
 */
export function linkedWarning(args: LinkedArgs): CalcWarning | undefined {
  return resolveLinked(args).warning;
}

/**
 * Bộ giá trị đưa vào công thức hạ nguồn.
 *
 * Trả `null` cho biến nào chưa có số dùng được, để nơi gọi bắt buộc phải xử lý thay vì
 * nhận nhầm số 0 (FR-06). Khoá của map là `spec.key`.
 */
export function linkedInputs(
  entries: ReadonlyArray<LinkedArgs>,
): Readonly<Record<string, number | null>> {
  const inputs: Record<string, number | null> = {};
  for (const entry of entries) {
    inputs[entry.spec.key] = resolveLinked(entry).value;
  }
  return inputs;
}

/** Các biến đang thiếu số dùng được — dựng thông điệp INCOMPLETE_INPUT hoặc chặn tính tiếp. */
export function missingLinkedLabels(entries: ReadonlyArray<LinkedArgs>): string[] {
  return entries.filter((entry) => resolveLinked(entry).value === null).map((e) => e.spec.label);
}
