import {
  CATEGORIES,
  MARKET_CONFIG,
  constantsAsOf,
  expectedCountOf,
  ok,
  scheduleOrDefault,
} from '@/application';
import { Button, Card, Chip, Input, Table } from '@/ui/primitives';

/**
 * Trang tạm để chứng minh bộ khung chạy được và đường đi giữa các tầng đúng.
 * Gói WBS 3.1.1 sẽ thay bằng màn WF-01 Trang chủ thật.
 */

/** Ngày tra biểu phí. Tầng Domain không tự lấy ngày hệ thống (NFR-REL-03). */
const NGAY_TRA = '2026-08-03';

export default function Home() {
  // Gọi qua @/application — đúng cửa. Import thẳng @/core ở đây sẽ bị ESLint chặn.
  const demo = ok(15.2, 'lần');

  const bieuPhi = scheduleOrDefault(MARKET_CONFIG);
  const hangSo = bieuPhi === undefined ? [] : constantsAsOf(bieuPhi, NGAY_TRA);

  return (
    <main>
      <h1>Falculator Finbox</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}>
        Bộ khung dự án — gói WBS 1.1 đến 1.3.3. Chưa có công thức nào.
      </p>

      <div style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        <Card eyebrow="Kiểm tra đường đi giữa các tầng" padded>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            {demo.value}{' '}
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 400 }}>{demo.unit}</span>
          </div>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
            Số này đi từ <code>src/core</code> qua <code>src/application</code> rồi mới tới đây.
          </p>
        </Card>

        <Card
          eyebrow="Gói 1.3.1"
          title="12 nhóm công thức"
          subtitle={`Chứng khoán ${expectedCountOf('stock')} · Cá nhân ${expectedCountOf('personal')}`}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                count={category.expectedCount}
                selected={category.id === 'fees-tax'}
              />
            ))}
          </div>
        </Card>

        <Card
          eyebrow="Gói 1.3.2"
          title={bieuPhi?.name ?? 'Chưa có biểu phí'}
          subtitle={`Hằng số đang có hiệu lực tại ngày ${NGAY_TRA}`}
          padded={false}
        >
          <Table caption="Biểu phí và thuế đang áp dụng" hideCaption>
            <thead>
              <tr>
                <th scope="col">Khoản mục</th>
                <th scope="col" className="numeric">
                  Mức
                </th>
                <th scope="col">Căn cứ</th>
              </tr>
            </thead>
            <tbody>
              {hangSo.map((constant) => (
                <tr key={constant.key}>
                  <th scope="row" style={{ fontWeight: 500 }}>
                    {constant.label}
                  </th>
                  <td className="numeric">
                    {constant.value} {constant.unit}
                  </td>
                  <td style={{ whiteSpace: 'normal', color: 'var(--color-muted)' }}>
                    {constant.legalBasis}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card eyebrow="Gói 1.2.1" title="Primitive hệ thiết kế">
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Input label="Giá thị trường" unit="₫" defaultValue={92000} hint="Tối thiểu 0 ₫" />
            <Input
              label="WACC"
              unit="%"
              defaultValue={11.4}
              tone="derived"
              hint="Nhận tự động từ công thức WACC"
            />
            <Input label="EPS" unit="₫" defaultValue={0} error="EPS bằng 0 — P/E không xác định." />
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Button>Tính lại</Button>
              <Button variant="secondary">Nạp số liệu mẫu</Button>
              <Button variant="ghost" size="sm">
                Hoàn tác
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <p
        style={{
          marginTop: 'var(--space-6)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-muted)',
        }}
      >
        Kết quả chỉ mang tính tham khảo, không phải khuyến nghị đầu tư.
      </p>
    </main>
  );
}
