'use client';

import type { ReactNode } from 'react';

import type { ControlType, Level, VariableSpec } from '@/application';

import { ButtonGroup } from './ButtonGroup';
import { NumberInput } from './NumberInput';
import { RadioGroup } from './RadioGroup';
import { SelectInput } from './SelectInput';
import { SliderInput } from './SliderInput';
import { Toggle } from './Toggle';

export interface VariableFieldProps {
  spec: VariableSpec;
  value: number;
  onChange: (value: number) => void;
  mode?: Level;
  /** Dòng phụ ghi nguồn hằng số, chỉ dùng cho toggle liên quan thuế/phí (CON-10). */
  sourceNote?: string;
  /**
   * Nguồn của giá trị đang hiện, khi nó KHÔNG do người dùng gõ — mã cổ phiếu vừa nạp ('HPG'), hay
   * tên công thức thượng nguồn trong chuỗi FR-15 ('CAPM').
   *
   * Chuyền thẳng xuống `NumberInput`, nơi `resolveInputState()` đổi nó thành trạng thái `derived`
   * của WF-16: viền đứt + dòng phụ `↳ <nguồn>`. Chỉ ô số nhận — mọi khoá mà bộ mẫu điền được đều là
   * `numberVar`, và `preset-inputs.test.ts` ghim điều đó.
   */
  derivedFrom?: string;
  /** Thay hẳn dòng phụ `↳ <nguồn>` bằng câu tự nói được nghĩa ('dữ liệu của VHM'). */
  derivedNote?: string;
  /**
   * Ô bị khoá vì lý do NGOÀI chế độ hiển thị, kèm dòng phụ nói lý do ('dữ liệu mẫu').
   *
   * Khác `derivedFrom` ở chỗ chuyền cho **mọi** kiểu điều khiển, không riêng ô số: những ô mã
   * không cấp được số có cả thanh trượt (`riskPercent`) lẫn danh sách chọn, và khoá sót một
   * kiểu là để lọt đúng thứ vừa hứa là đã khoá.
   */
  lockedNote?: string;
  /**
   * Bản "ô nhỏ" của khối gộp — chỉ có hiệu lực từ 1280px, xem `InputProps.compact`.
   *
   * Bốn kiểu điều khiển nhận cờ này: ô số, thanh trượt, danh sách chọn, nhóm nút — đúng bốn kiểu
   * mà 111 công thức thật sự dùng. `radio` và `toggle` có trong `ControlType` nhưng KHÔNG công
   * thức nào khai, nên chúng bỏ qua cờ thay vì mang một bản thu gọn chưa ai nhìn thấy bao giờ.
   */
  compact?: boolean;
  /** Con dấu nguồn của giá trị, chỉ hiện ở ô nhỏ — xem `InputProps.sourceMark`. */
  sourceMark?: ReactNode;
  className?: string;
}

/**
 * Điều khiển KHÔNG xếp hai cột được ở khổ 360px — phải chiếm trọn một hàng của lưới ô nhập.
 *
 * Ô số và danh sách chọn vừa nửa bề ngang; thanh trượt, nhóm nút và công tắc thì không — chúng
 * cần cả chiều ngang cho nhãn, giá trị và hai mốc min/max. Bản thiết kế hi-fi vẽ đúng vậy: WF-08
 * bốn ô số thành lưới 2×2, WF-14 ba thanh trượt xếp dọc.
 *
 * Ở đây chứ không ở từng màn: danh sách này từng nằm riêng trong `FormulaDetail.tsx`, và khối
 * chuỗi WF-04 dựng sau đã bỏ sót nó — hậu quả là năm thanh trượt của chuỗi WACC rơi vào ô lưới
 * 143px, nhãn vỡ thành sáu dòng một chữ và ô giá trị 14ch lọt hẳn ra ngoài khung, kéo cả trang
 * tràn ngang ở 360px. Một danh sách dùng chung thì màn mới không lệch được nữa.
 */
export function isWideControl(type: ControlType): boolean {
  return type === 'slider' || type === 'buttonGroup' || type === 'radio' || type === 'toggle';
}

/**
 * Ô hẹp nào ĐỨNG MỘT MÌNH trên hàng của lưới hai cột — khổ dưới 1024px (15/10/2026).
 *
 * Chủ dự án khoanh ô "Hệ số beta (β)" của `capm` ở khổ điện thoại: ô số chiếm nửa trái, nửa phải
 * trống trơn vì hai ô kề nó là thanh trượt chiếm trọn hàng — _"chuyển ô nhập sang bên phải để tối
 * ưu không gian"_. Đo cả thư viện ở 360px: 35 công thức (39 ở Nâng cao, tính cả khối chuỗi) có
 * đúng một hàng như thế. Ô được đánh dấu ở đây chiếm trọn hàng, nhãn trên, khung nhập dưới rộng hết
 * bề ngang (`.fieldLone` ở hai file CSS của lưới). Bản đầu xếp nhãn trái · khung phải trên một hàng;
 * chủ dự án bác cùng ngày — _"như này thì không được. sửa lại để ô nhập ở dưới"_.
 *
 * Tính trên thứ tự ô chứ không đo DOM: đo ở trình duyệt thì HTML tĩnh không biết, và hàng sẽ nhảy
 * sau hydrate. Đúng được là nhờ hai điều kiện của lưới dưới 1024px — đổi một trong hai thì đổi hàm này:
 *
 * - **Đúng hai cột** (trần hai cột đặt ở CSS). Ô rộng chiếm `1 / -1`, nên mỗi dải ô hẹp liền nhau
 *   bắt đầu ở cột 1 và ghép cặp; dải lẻ thì ô CUỐI dải đứng một mình.
 * - **`auto-fit` xoá rãnh rỗng**: lưới chỉ có một ô thì ô ấy nở hết bề ngang, không thừa chỗ nào,
 *   nên không đánh dấu. Có một ô rộng bất kỳ là cả hai rãnh có người, rãnh không bị xoá.
 *
 * `wide` là cờ "chiếm trọn hàng" của từng ô theo đúng thứ tự dựng — `isWideControl()` hoặc ô
 * móc nối `LinkedInput`, đúng phép xét mà nơi gọi dùng để chọn lớp `fieldWide`.
 */
export function loneNarrowFlags(wide: readonly boolean[]): boolean[] {
  const lone = wide.map(() => false);
  if (wide.length < 2) return lone;

  let run = 0;
  wide.forEach((isWide, index) => {
    if (isWide) {
      run = 0;
      return;
    }
    run += 1;
    const endsRun = index === wide.length - 1 || wide[index + 1] === true;
    if (endsRun && run % 2 === 1) lone[index] = true;
  });
  return lone;
}

/**
 * Chọn đúng điều khiển nhập liệu cho một biến — FR-05, LDR-01.
 *
 * Đây là chỗ biến lời hứa "giao diện sinh hoàn toàn từ VariableSpec" thành sự thật ở cấp màn
 * hình: màn chi tiết chỉ việc duyệt `variablesForLevel()` rồi dựng component này cho từng biến,
 * không màn nào phải biết biến nào dùng ô số và biến nào dùng thanh trượt.
 *
 * Thêm một `ControlType` mới vào Domain thì TypeScript bắt phải xử lý ở đây — `switch` này
 * vét cạn union, thiếu nhánh là hỏng lúc typecheck chứ không âm thầm ra ô trống.
 */
export function VariableField({
  spec,
  value,
  onChange,
  mode,
  sourceNote,
  derivedFrom,
  derivedNote,
  lockedNote,
  compact,
  sourceMark,
  className,
}: VariableFieldProps) {
  const shared = { spec, value, onChange, mode, lockedNote, className };

  switch (spec.type) {
    case 'slider':
      return <SliderInput {...shared} compact={compact} sourceMark={sourceMark} />;
    case 'buttonGroup':
      return <ButtonGroup {...shared} compact={compact} sourceMark={sourceMark} />;
    case 'radio':
      return <RadioGroup {...shared} />;
    case 'select':
      return <SelectInput {...shared} compact={compact} sourceMark={sourceMark} />;
    case 'toggle':
      return <Toggle {...shared} sourceNote={sourceNote} />;
    case 'number':
      return (
        <NumberInput
          {...shared}
          derivedFrom={derivedFrom}
          derivedNote={derivedNote}
          compact={compact}
          sourceMark={sourceMark}
        />
      );
  }
}
