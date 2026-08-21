'use client';

import { variablesForLevel } from '@/application';
import type { FormulaSpec, Level } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { Table } from '@/ui/primitives';

export interface VariableTableProps {
  formula: FormulaSpec;
  /** Chế độ Cơ bản chỉ liệt kê biến cơ bản, Nâng cao liệt kê tất (FR-09). */
  mode?: Level;
  className?: string;
}

/**
 * Bảng biến ba cột — gói WBS 2.4.5.
 *
 * WF-03 khối 7 chốt đúng ba cột `BIẾN | ĐƠN VỊ | MÔ TẢ`, sinh thẳng từ Registry (FR-02, LDR-01).
 * Lọc theo chế độ hiển thị bằng `variablesForLevel()` sẵn có, không tự viết lại bộ lọc.
 *
 * Dựng trên primitive `Table` nên đã có sẵn vùng cuộn ngang riêng — bảng dài không kéo cả
 * trang cuộn ngang (NFR-USA-02).
 */
export function VariableTable({ formula, mode = 'advanced', className }: VariableTableProps) {
  const t = useT();
  const pick = usePick();
  const variables = variablesForLevel(formula, mode);

  return (
    <Table caption={t('variable.tableCaption')} hideCaption className={className}>
      <thead>
        <tr>
          <th scope="col">{t('variable.colName')}</th>
          <th scope="col">{t('variable.colUnit')}</th>
          <th scope="col">{t('variable.colDescription')}</th>
        </tr>
      </thead>
      <tbody>
        {variables.map((variable) => (
          <tr key={variable.key}>
            <th scope="row">{pick(variable.label)}</th>
            <td>{variable.unit}</td>
            <td>
              {variable.description !== undefined
                ? pick(variable.description)
                : t('variable.noDescription')}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
