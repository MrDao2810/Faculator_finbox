'use client';

import { useState } from 'react';

import {
  WARNING_CODES,
  divideByZero,
  fail,
  findUnitScale,
  formatValueWithUnit,
  incompleteInput,
  inheritedFrom,
  meaningless,
  missingSeries,
  modelViolation,
  ok,
  scaleToUnit,
} from '@/application';
import type {
  CalcWarning,
  Level,
  LinkedUpstream,
  UnitScaleId,
  VariableSpec,
  WarningCode,
} from '@/application';
import {
  ButtonGroup,
  LinkedInput,
  NumberInput,
  RadioGroup,
  SelectInput,
  SliderInput,
  Toggle,
  UnitSwitcher,
} from '@/ui/inputs';
import { Button, Card } from '@/ui/primitives';
import {
  ErrorState,
  ExampleBlock,
  ExplanationAccordion,
  FlowChainStrip,
  ResultBlock,
  SourceBlock,
  StatTile,
  VariableTable,
} from '@/ui/result';

import { FLOW_DEMO, PE_DEMO } from './fixtures';
import styles from './Showcase.module.css';

/** Sáu loại lỗi chuẩn của WF-15, dựng bằng đúng catalog tầng Domain. */
const WF15: Readonly<Record<WarningCode, CalcWarning>> = {
  DIVIDE_BY_ZERO: divideByZero('P/E', 'EPS'),
  MEANINGLESS: meaningless(
    'P/E không có ý nghĩa khi doanh nghiệp đang lỗ. Hãy dùng P/B hoặc P/S để thay thế.',
    'Gợi ý chuyển sang P/B',
  ),
  MISSING_SERIES: missingSeries(60, 24),
  MODEL_VIOLATION: modelViolation('g ≥ WACC', 'Giảm g xuống dưới 12,1%'),
  INHERITED: inheritedFrom('Beta', 'WACC'),
  INCOMPLETE_INPUT: incompleteInput(['Giá bán']),
};

function variable(key: string): VariableSpec {
  const found = PE_DEMO.variables.find((v) => v.key === key);
  if (found === undefined) throw new Error(`Fixture thiếu biến '${key}'.`);
  return found;
}

const capmOk: LinkedUpstream = { formulaId: 'capm', label: 'CAPM', output: ok(14.3, '%') };
const capmLoi: LinkedUpstream = {
  formulaId: 'capm',
  label: 'CAPM',
  output: fail('%', missingSeries(60, 24)),
};

const wacc: VariableSpec = {
  key: 'wacc',
  label: 'WACC',
  unit: '%',
  type: 'number',
  defaultValue: 12.1,
  min: 0,
  max: 100,
  level: 'basic',
};

/**
 * Phần động của màn thử — gói WBS 2.3 và 2.4.
 *
 * Tách khỏi page.tsx vì cần 'use client': mọi điều khiển nhập liệu đều có handler.
 */
export function Showcase() {
  const [mode, setMode] = useState<Level>('advanced');
  const [price, setPrice] = useState(92_000);
  const [eps, setEps] = useState(6_050);
  const [growth, setGrowth] = useState(4);
  const [period, setPeriod] = useState(2);
  const [cashflow, setCashflow] = useState(1);
  const [schedule, setSchedule] = useState(1);
  const [dividendTax, setDividendTax] = useState(0);
  const [unit, setUnit] = useState<UnitScaleId>('dong');
  const [override, setOverride] = useState<number | undefined>(undefined);

  // Đi qua ok() nên NaN và Infinity tự thành fail — không nhánh nào lọt ra màn (FR-06).
  const result = eps === 0 ? fail('lần', divideByZero('P/E', 'EPS')) : ok(price / eps, 'lần');

  return (
    <div className={styles.page}>
      <div className={styles.modeBar}>
        <span className={styles.modeLabel}>Chế độ đang xem:</span>
        <Button
          variant={mode === 'basic' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setMode('basic');
          }}
        >
          Cơ bản
        </Button>
        <Button
          variant={mode === 'advanced' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setMode('advanced');
          }}
        >
          Nâng cao
        </Button>
      </div>

      <Card eyebrow="Gói 2.3.1" title="Ô số — năm trạng thái WF-16">
        <div className={styles.stack}>
          <NumberInput spec={variable('price')} value={price} onChange={setPrice} mode={mode} />
          <NumberInput spec={variable('eps')} value={eps} onChange={setEps} mode={mode} />
          <NumberInput
            spec={{ ...variable('price'), label: 'Ô nhận tự động' }}
            value={14.3}
            onChange={() => undefined}
            derivedFrom="CAPM"
            mode={mode}
          />
          <NumberInput
            spec={{ ...variable('price'), label: 'Ô ngoài miền hợp lệ', min: 0 }}
            value={-4}
            onChange={() => undefined}
            mode={mode}
          />
          <NumberInput spec={variable('growth')} value={growth} onChange={setGrowth} mode="basic" />
          <p className={styles.note}>
            Ô cuối luôn ở chế độ Cơ bản để thấy trạng thái khoá; bốn ô trên đổi theo nút phía trên.
          </p>
        </div>
      </Card>

      <Card eyebrow="Gói 2.3.2" title="Thanh trượt · nhóm nút · radio">
        <div className={styles.stack}>
          <SliderInput spec={variable('growth')} value={growth} onChange={setGrowth} mode={mode} />
          <ButtonGroup spec={variable('period')} value={period} onChange={setPeriod} mode={mode} />
          <RadioGroup
            spec={variable('cashflow')}
            value={cashflow}
            onChange={setCashflow}
            mode={mode}
          />
        </div>
      </Card>

      <Card eyebrow="Gói 2.3.3" title="Danh sách chọn · toggle · chuyển đơn vị">
        <div className={styles.stack}>
          <SelectInput
            spec={variable('schedule')}
            value={schedule}
            onChange={setSchedule}
            mode={mode}
          />
          <Toggle
            spec={variable('dividendTax')}
            value={dividendTax}
            onChange={setDividendTax}
            mode={mode}
            sourceNote="Market Config · CON-10"
          />
          <div>
            <UnitSwitcher value={unit} onChange={setUnit} />
            <p className={styles.note}>
              Giá thị trường quy về bậc đang chọn:{' '}
              <strong>
                {formatValueWithUnit(scaleToUnit(price, unit), findUnitScale(unit).label, {
                  maxDecimals: 4,
                })}
              </strong>
            </p>
          </div>
        </div>
      </Card>

      <Card eyebrow="Gói 2.3.4" title="Ô nhập móc nối — bốn trạng thái FR-15">
        <div className={styles.stack}>
          <div>
            <p className={styles.caseLabel}>Thượng nguồn bình thường — bấm Ghi đè rồi Hoàn tác</p>
            <LinkedInput
              spec={wacc}
              upstream={capmOk}
              override={override}
              onOverrideChange={setOverride}
              mode={mode}
            />
          </div>
          <div>
            <p className={styles.caseLabel}>Thượng nguồn lỗi — cảnh báo kế thừa</p>
            <LinkedInput spec={wacc} upstream={capmLoi} onOverrideChange={() => undefined} />
          </div>
          <div>
            <p className={styles.caseLabel}>Thượng nguồn lỗi nhưng đã ghi đè — thoát được lỗi</p>
            <LinkedInput
              spec={wacc}
              upstream={capmLoi}
              override={11}
              onOverrideChange={() => undefined}
            />
          </div>
          <div>
            <p className={styles.caseLabel}>Không móc nối — ô nhập tay</p>
            <LinkedInput spec={wacc} onOverrideChange={() => undefined} />
          </div>
        </div>
      </Card>

      <Card eyebrow="Gói 2.4.1" title="Khối kết quả">
        <div className={styles.stack}>
          <ResultBlock
            output={result}
            interpretation="Cao hơn trung bình ngành (12,4) — thị trường đang kỳ vọng tăng trưởng."
          />
          <p className={styles.note}>Đặt EPS về 0 ở khối trên để thấy khối này chuyển sang lỗi.</p>
        </div>
      </Card>

      <Card eyebrow="Gói 2.4.2" title="Sáu loại lỗi chuẩn WF-15">
        <div className={styles.stack}>
          {WARNING_CODES.map((code) => (
            <ErrorState key={code} warning={WF15[code]} unit="lần" />
          ))}
        </div>
      </Card>

      <Card eyebrow="Gói 2.4.4" title="Diễn giải bốn mục FR-03" padded>
        <ExplanationAccordion explanation={PE_DEMO.explanation} />
      </Card>

      <Card eyebrow="Gói 2.4.5" title="Bảng biến" padded={false}>
        <VariableTable formula={PE_DEMO} mode={mode} />
      </Card>

      <Card eyebrow="Gói 2.4.5" title="Ví dụ và nguồn">
        <div className={styles.stack}>
          <ExampleBlock formula={PE_DEMO} />
          <SourceBlock sources={PE_DEMO.source} />
        </div>
      </Card>

      <Card eyebrow="Gói 2.4.6" title="Dải luồng WF-04">
        <FlowChainStrip formulas={FLOW_DEMO} currentId="wacc" />
      </Card>

      <Card eyebrow="Gói 2.4.7" title="Thẻ chỉ số">
        <div className={styles.tiles}>
          <StatTile label="Tổng giá trị" output={ok(1_284_500_000, '₫')} decimals={0} />
          <StatTile label="Beta danh mục" output={ok(1.12, '')} />
          <StatTile label="XIRR" output={fail('%', missingSeries(60, 24))} />
          <StatTile label="Số mã" output={ok(7, 'mã')} decimals={0} />
        </div>
      </Card>
    </div>
  );
}
