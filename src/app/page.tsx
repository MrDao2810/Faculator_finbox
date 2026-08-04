import {
  CATEGORIES,
  MARKET_CONFIG,
  constantsAsOf,
  expectedCountOf,
  ok,
  scheduleOrDefault,
  t,
} from '@/application';
import { Card, Chip, Table } from '@/ui/primitives';

/**
 * Trang chủ tạm — chứng minh bộ khung chạy được và đường đi giữa các tầng đúng.
 * Gói WBS 3.1.1 sẽ thay bằng màn WF-01 thật.
 */

/** Ngày tra biểu phí. Tầng Domain không tự lấy ngày hệ thống (NFR-REL-03). */
const NGAY_TRA = '2026-08-03';

export default function Home() {
  // Gọi qua @/application — đúng cửa. Import thẳng @/core ở đây sẽ bị ESLint chặn.
  const demo = ok(15.2, 'lần');

  const bieuPhi = scheduleOrDefault(MARKET_CONFIG);
  const hangSo = bieuPhi === undefined ? [] : constantsAsOf(bieuPhi, NGAY_TRA);

  return (
    <>
      <h1>{t('app.name')}</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}>
        {t('page.placeholder.home')}
      </p>

      <div style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
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
                  {/* Giữ nowrap của khung bảng: cột dài thì cuộn ngang, không kéo dòng cao lên. */}
                  <td style={{ color: 'var(--color-muted)' }}>{constant.legalBasis}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
