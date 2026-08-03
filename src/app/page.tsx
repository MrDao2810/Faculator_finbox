import { ok } from '@/application';

/**
 * Trang tạm để chứng minh bộ khung chạy được và đường đi giữa các tầng đúng.
 * Gói WBS 3.1.1 sẽ thay bằng màn WF-01 Trang chủ thật.
 */
export default function Home() {
  // Gọi qua @/application — đúng cửa. Import thẳng @/core ở đây sẽ bị ESLint chặn.
  const demo = ok(15.2, 'lần');

  return (
    <main>
      <h1 style={{ margin: 0, fontSize: 26 }}>Falculator Finbox</h1>
      <p style={{ color: 'var(--muted)', marginTop: 4 }}>
        Bộ khung dự án — gói WBS 1.1.1 và 1.1.2. Chưa có tính năng nào.
      </p>

      <section
        style={{
          marginTop: 24,
          padding: 16,
          border: `1px solid var(--line)`,
          borderRadius: 'var(--radius)',
          background: '#fff',
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--muted)' }}>
          KIỂM TRA ĐƯỜNG ĐI GIỮA CÁC TẦNG
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
          {demo.value} <span style={{ fontSize: 16, fontWeight: 400 }}>{demo.unit}</span>
        </div>
        <p style={{ marginBottom: 0, color: 'var(--muted)', fontSize: 13 }}>
          Số này đi từ <code>src/core</code> qua <code>src/application</code> rồi mới tới đây. Nếu
          trang hiện được con số, nghĩa là bốn tầng đã nối đúng.
        </p>
      </section>

      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--muted)' }}>
        Kết quả chỉ mang tính tham khảo, không phải khuyến nghị đầu tư.
      </p>
    </main>
  );
}
