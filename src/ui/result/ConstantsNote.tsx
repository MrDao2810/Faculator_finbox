'use client';

import type { TypedMarketConstant } from '@/application';
import { formatIsoDate, formatValueWithUnit } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './ConstantsNote.module.css';

export interface ConstantsNoteProps {
  constants: ReadonlyArray<TypedMarketConstant>;
}

/**
 * Hằng số thuế & phí mà công thức đang tính theo — bày ngay dưới khối Số liệu.
 *
 * Vì sao có khối này: hằng số MarketConfig KHÔNG phải một ô nhập nên nó không xuất hiện ở bảng
 * biến, cũng không nằm trong khối Nguồn (chỗ đó dành cho `spec.source`). Trước gói này, màn
 * `phi-giao-dich-mua` cho ra 138.000 ₫ từ 1.000 CP × 92.000 ₫ mà mức 0,15% không hiện ở bất kỳ
 * đâu trên trang — người dùng không có cách nào biết con số đang tính theo tỷ lệ nào, trong khi
 * đó lại đúng là thứ khác nhau giữa các công ty chứng khoán. Đo được: 13 trong 108 công thức tra
 * hằng số, 5 trong số đó không có `example.note` nêu mức nào cả.
 *
 * Ba mảnh thông tin, không cắt bớt mảnh nào:
 *   • trị số + đơn vị — thứ người dùng cần để đối chiếu với sao kê của công ty chứng khoán;
 *   • ngày hiệu lực — vì `resolve.ts` tra theo `asOf`, mở lại một giao dịch cũ sẽ ra mức khác,
 *     và không có ngày thì con số trông như thể nó bất biến;
 *   • căn cứ pháp lý — LDR-03 đã bắt mọi bản ghi phải có, giấu đi thì bắt để làm gì.
 *
 * Không có ô nào cho người dùng sửa ở đây: mức thuế và phí lưu ký là luật định, còn phí môi giới
 * sửa ở màn Cài đặt qua ô chọn biểu phí. Khối này chỉ nói đang dùng mức nào.
 */
export function ConstantsNote({ constants }: ConstantsNoteProps) {
  const t = useT();
  if (constants.length === 0) return null;

  return (
    <section className={styles.block}>
      <h3 className={styles.title}>{t('detail.constantsInUse')}</h3>
      <dl className={styles.list}>
        {constants.map((constant) => (
          <div key={`${constant.key}@${constant.effectiveFrom}`} className={styles.row}>
            <dt className={styles.label}>{constant.label}</dt>
            <dd className={styles.value}>
              {/*
                Trị số ghi theo đúng quy ước CON-05 của bản ghi: 0,15 với đơn vị '%' ra "0,15 %".
                Ba chữ số thập phân vì phí lưu ký là 0,27 ₫/CP/tháng và có thể còn lẻ hơn — cắt ở
                2 số là làm tròn mất một mức phí thật.
              */}
              <span className={styles.amount}>
                {formatValueWithUnit(constant.value, constant.unit, { maxDecimals: 3 })}
              </span>
              <span className={styles.since}>
                {t('detail.constantSince')} {formatIsoDate(constant.effectiveFrom)}
              </span>
              <span className={styles.basis}>{constant.legalBasis}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
