/**
 * Tầng DOMAIN — nội dung của file xuất ra (gói WBS 2.5.3).
 *
 * FR-22: xuất PDF/PNG kèm biểu đồ và bảng biến.
 * FR-24: **miễn trừ đính kèm là bắt buộc, KHÔNG có tuỳ chọn tắt.** WF-12 ghi thẳng trên màn:
 * "Miễn trừ tự động đính kèm · Không thể tắt — mọi file xuất ra đều mang tuyên bố miễn trừ."
 *
 * Vì thế phần dựng nội dung nằm ở đây chứ không ở component: `buildExportContent()` là cổng
 * duy nhất, và nó luôn gắn `disclaimer` bất kể tuỳ chọn nào. Không có đường nào dựng được một
 * file xuất thiếu miễn trừ — cùng cách nghĩ với `ok()` giữ FR-06.
 */

import { DISCLAIMER_VI, DRAFT_DATA_NOTE_VI } from './disclaimer';
import { formatCalcOutput } from './format';
import type { CalcOutput, Level, VariableSpec } from './types';
import type { FormulaSpec } from './registry/types';
import { variablesForLevel } from './registry/build';

export { DISCLAIMER_VI };

export type ExportFormat = 'pdf' | 'png';

export interface ExportOptions {
  format: ExportFormat;
  /** Kèm biểu đồ (FR-22). */
  includeChart: boolean;
  /** Kèm bảng biến và phần giải thích. */
  includeDetails: boolean;
  /** Chế độ hiển thị — quyết định bảng biến liệt kê những biến nào (FR-09). */
  mode?: Level;
  /**
   * Người dùng vừa nạp một bộ số liệu MẪU (bản thảo) vào các ô nhập.
   *
   * File xuất ra rời khỏi ứng dụng và được chia sẻ cho người khác — người nhận không có cách
   * nào biết con số trong đó dựng từ số liệu tự dựng hay từ báo cáo thật. Cờ này để ghi điều
   * đó vào chính file. Không phải tuỳ chọn của người dùng: nơi gọi đặt theo trạng thái thật.
   */
  fromDraftData?: boolean;
}

export interface ExportLine {
  label: string;
  value: string;
}

export interface ExportContent {
  title: string;
  subtitle: string;
  /** Dòng kết quả đã định dạng, hoặc '— , —' kèm đơn vị khi không tính được (FR-06). */
  result: string;
  /** Câu diễn giải, có thì mới hiện. */
  interpretation?: string;
  /** Giá trị đầu vào, luôn có. */
  inputs: ReadonlyArray<ExportLine>;
  /** Bảng biến — rỗng khi người dùng tắt `includeDetails`. */
  variables: ReadonlyArray<ExportLine>;
  /** Bốn mục diễn giải — rỗng khi tắt `includeDetails`. */
  explanation: ReadonlyArray<ExportLine>;
  /** Nguồn tham khảo (FR-04). */
  sources: ReadonlyArray<string>;
  /** Có chừa chỗ cho biểu đồ hay không. */
  includeChart: boolean;
  /**
   * Câu miễn trừ. LUÔN có nội dung, không tuỳ chọn nào tắt được (FR-24).
   * Kiểu là `string` chứ không phải `string | undefined` — sai chỗ này là hỏng lúc typecheck.
   */
  disclaimer: string;
  /**
   * Câu ghi rõ số liệu đầu vào là bản thảo, chỉ có khi `options.fromDraftData`.
   * Đi cùng `disclaimer` nhưng KHÁC nó: miễn trừ nói về tính chất tham khảo của kết quả,
   * câu này nói về độ tin cậy của ĐẦU VÀO.
   */
  draftNote?: string;
}

/**
 * Dựng nội dung file xuất.
 *
 * @param inputs giá trị đang nhập, khoá là `VariableSpec.key`
 */
export function buildExportContent(
  formula: FormulaSpec,
  output: CalcOutput,
  inputs: Readonly<Record<string, number>>,
  options: ExportOptions,
  interpretation?: string,
): ExportContent {
  const mode = options.mode ?? 'advanced';
  const shown = variablesForLevel(formula, mode);

  const inputLines: ExportLine[] = shown.map((variable) => ({
    label: variable.label,
    value: describeInput(inputs[variable.key], variable),
  }));

  const variableLines: ExportLine[] = options.includeDetails
    ? shown.map((variable) => ({
        label: `${variable.label} (${variable.unit})`,
        value: variable.description ?? '—',
      }))
    : [];

  const explanationLines: ExportLine[] = options.includeDetails
    ? [
        { label: 'Công thức này nói lên điều gì', value: formula.explanation.meaning },
        { label: 'Khi nào dùng', value: formula.explanation.whenToUse },
        { label: 'Cách đọc kết quả', value: formula.explanation.howToRead },
        { label: 'Sai lầm thường gặp', value: formula.explanation.commonMistakes },
      ]
    : [];

  return {
    title: formula.name.vi,
    subtitle: formula.description,
    result: formatCalcOutput(output),
    interpretation,
    inputs: inputLines,
    variables: variableLines,
    explanation: explanationLines,
    sources: formula.source.map((source) => source.label),
    // Chừa chỗ biểu đồ chỉ có nghĩa khi công thức thật sự có biểu đồ (FR-07).
    includeChart: options.includeChart && formula.chartType !== 'none',
    // KHÔNG nhận từ tham số, KHÔNG có nhánh nào bỏ qua. Đây chính là FR-24.
    disclaimer: DISCLAIMER_VI,
    ...(options.fromDraftData === true ? { draftNote: DRAFT_DATA_NOTE_VI } : {}),
  };
}

/**
 * Chuỗi mô tả một giá trị đầu vào trong file xuất.
 *
 * Biến kiểu chọn (select · radio · toggle · buttonGroup) phải hiện NHÃN chứ không hiện con số:
 * người nhận file đọc "Kỳ số liệu: 2" thì không hiểu gì, còn "Kỳ số liệu: Năm" thì hiểu ngay.
 * Giá trị số chỉ có nghĩa bên trong công thức (LDR-02).
 */
function describeInput(value: number | undefined, spec: VariableSpec): string {
  if (value === undefined || !Number.isFinite(value)) {
    return formatCalcOutput({ value: null, unit: spec.unit });
  }

  const option = spec.options?.find((item) => item.value === value);
  if (option !== undefined) return option.label;

  return formatCalcOutput({ value, unit: spec.unit });
}

/** Tên file gợi ý. Chỉ dùng ký tự an toàn cho mọi hệ điều hành. */
export function exportFileName(formula: FormulaSpec, format: ExportFormat): string {
  const slug = formula.id.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
  return `faculator-${slug}.${format}`;
}
