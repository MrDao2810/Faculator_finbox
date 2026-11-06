/**
 * Nối con số với đơn vị của nó bằng dấu cách không ngắt, cho ô giá trị của bảng số liệu (06/11/2026).
 *
 * Chủ dự án khoanh "4 / năm" và "3 / năm" trong bảng số liệu câu CAGR trên điện thoại: _"điều chỉnh lại
 * những phần như này sao cho Năm không bị xuống dòng và phải cùng dòng với số liệu bên trái"_. CSS giữ
 * ô của giá trị ngắn không bị bóp (`laGiaTriNgan()` bên dưới), còn giá trị dài vẫn phải được xuống
 * dòng. Nối ở đây thì dù ô dài có hẹp tới đâu, chữ chỉ xuống dòng ở chỗ khác, không bao giờ tách đơn
 * vị khỏi con số.
 *
 * Ba chỗ nối, đo trên cả kho câu hỏi: số rồi một chữ, `₫` hay `%` ("4 năm", "600.000.000 ₫", "0,57
 * lần"); chữ chỉ bậc rồi đơn vị tiền ("tỷ đồng", "billion ₫"); và đơn vị tiền đứng TRƯỚC số ("VND
 * 71,150.89"). Không đụng dấu cách sau dấu phẩy hay chấm phẩy: chuỗi "19%; 12%; 23%" vẫn xuống dòng
 * giữa các số.
 */

const NBSP = '\u00a0';

/**
 * Giá trị NGẮN thì ô của nó không bị bóp (`QuizBody.module.css`, `.fact dd[data-ngan]`). Đổ cả kho câu
 * hỏi (1.284 cặp nhãn và giá trị) vào bảng thật trên Chrome ở 360, 390, 768 và 1440px để đo: không giá
 * trị nào tới 24 ký tự làm tràn khung khi giữ nguyên bề ngang, còn giá trị dài hơn phải được xuống dòng
 * (kho có giá trị tới 100 ký tự). Ngưỡng trên dữ liệu chứ không trong CSS, vì CSS không biết độ dài chữ
 * và đo lúc chạy thì lượt dựng đầu sẽ lệch HTML tĩnh.
 */
export const GIA_TRI_NGAN = 24;

export function laGiaTriNgan(chu: string): boolean {
  return chu.length <= GIA_TRI_NGAN;
}

export function giuSoVoiDonVi(chu: string): string {
  return chu
    .replace(/\b(VND|USD) (?=[−+-]?\d)/g, `$1${NBSP}`)
    .replace(/(\d%?) (?=[\p{L}₫%])/gu, `$1${NBSP}`)
    .replace(
      /(tỷ|triệu|nghìn|ngàn|billion|million|thousand|trillion) (?=₫|đồng|VND|USD|dong)/gu,
      `$1${NBSP}`,
    );
}
