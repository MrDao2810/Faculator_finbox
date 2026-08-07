# Thư viện công thức

Nhánh 5 của WBS. Đủ **107 / 107** công thức.

Mỗi công thức là một `FormulaModule` — mô tả và cách tính nằm trong **cùng một object**:

```ts
export interface FormulaModule {
  spec: FormulaSpec; // metadata: biến, diễn giải, nguồn, ca kiểm thử
  calc: CalcFn; // hàm tính
}
```

Gộp lại chứ không tách thành hai bảng tra theo id, vì tách đôi thì khai một công thức mà quên
viết hàm tính là lỗi chỉ lộ ra lúc chạy; gộp lại thì typecheck bắt ngay.

## Thêm một công thức mới

Bốn việc, không có việc thứ năm:

1. Viết `FormulaModule` trong file nhóm tương ứng (`fees.ts`, `personal.ts`, `returns.ts`,
   `multiples.ts`, `risk.ts` — hoặc file mới nếu là nhóm chưa có).
2. Thêm nó vào mảng xuất ở cuối file đó (`FEE_FORMULAS`, `PERSONAL_FORMULAS`, …).
3. Nếu là file nhóm mới: thêm mảng đó vào `FORMULA_MODULES` trong `index.ts`.
4. Chạy `npm run check`.

Không phải đăng ký ở đâu khác. `FORMULAS`, `sitemap.xml`, trang `/cong-thuc/<id>/`, khối nổi bật
ở trang chủ và bộ tìm kiếm đều đọc từ `FORMULA_MODULES`.

## Những chỗ bắt buộc, có test canh

| Bắt buộc                                          | Bắt ở đâu                                  |
| ------------------------------------------------- | ------------------------------------------ |
| Đủ bốn mục diễn giải (FR-03)                      | validator Registry                         |
| Có nguồn tham khảo (FR-04)                        | validator Registry                         |
| Có ít nhất một ca kiểm thử (NFR-MNT-02)           | validator Registry                         |
| **Các ca kiểm thử đó phải ĐẠT**                   | `formulas.test.ts` chạy chính `spec.tests` |
| `example` khớp đúng kết quả hàm tính              | `formulas.test.ts`                         |
| `expression` đọc được, không lẫn LaTeX            | `formulas.test.ts`                         |
| id chỉ dùng chữ thường và gạch ngang (đi vào URL) | validator Registry                         |
| Không vượt `expectedCount` của SRS 3.8            | `formulas.test.ts`                         |

## Ba luật của thân hàm tính

**1. Không `return someNumber` trần.** Mọi lối ra đi qua `ok()`, `fail()` hoặc `inherited()`.
`ok()` là lưới cuối: giá trị không hữu hạn tự thành `fail`.

**2. Không viết mức thuế/phí vào thân hàm** (LDR-03, CON-10). Đọc qua `rateOf(ctx, key)` hoặc
`constantOf(ctx, key)`. Tra không ra thì báo lỗi, tuyệt đối không coi là 0.

**3. Ô để trống không phải số 0.** `runFormula()` đã chặn trước: biến nào thiếu thì ra cảnh báo
"Chưa nhập đủ" kèm tên ô. Trong thân hàm, mọi biến khai trong spec đều đã có mặt và hữu hạn.

## Ca biên phải nhớ viết test

Đây là chỗ FR-06 hay thủng nhất:

- mẫu số bằng 0 → `DIVIDE_BY_ZERO`;
- kết quả tính ra được nhưng vô nghĩa (P/E khi lỗ) → `MEANINGLESS` kèm gợi ý thay thế;
- lãi suất 0% ở công thức niên kim → có nhánh riêng, nếu không thì chia cho 0;
- kỳ hạn hoặc số kỳ bằng 0;
- vòng lặp không hội tụ (XIRR) → trả `null`, không trả số bừa.

Cùng một tình huống thì phải dùng cùng một mã cảnh báo ở mọi công thức. Kỳ hạn 0 ở
`tra-gop-nien-kim`, `tra-gop-goc-deu` và `tiet-kiem-muc-tieu` đều là `DIVIDE_BY_ZERO`.

## Nguồn số liệu kiểm chứng

Con số trong `tests[]` không tự nghĩ ra, mà lấy từ nguồn độc lập rồi mới viết hàm:

| Nhóm            | Nguồn đối chiếu                                                     |
| --------------- | ------------------------------------------------------------------- |
| Phí & thuế      | ví dụ đã tính sẵn của WF-08 trong wireframe                         |
| Vay nợ          | ví dụ WF-14, đối chiếu chéo bằng dạng đóng `i × P × (n+1) / 2`      |
| Tiết kiệm       | tài liệu "FORMULAS & UNIT TEST" của bộ FINANCE CALC (các ca UT-CI-) |
| Bội số định giá | ví dụ P/E của WF-03                                                 |

Riêng **34 công thức chuỗi giá** (nhóm Rủi ro và Kỹ thuật) không có nguồn ví dụ dựng sẵn, nên
chúng đi qua một vòng khác: một lượt tính lại **độc lập** từ `latex`/`expression` và định nghĩa
chuẩn của từng chỉ báo, bằng script riêng, **không đọc hàm `calc`**. 122 con số cộng 64 tiền đề
ca cảnh báo, khớp hết. Chỗ nào có nhiều quy ước hợp lệ thì tính đủ mọi quy ước rồi mới kết luận
— xem mục "Quy ước đã chốt" ngay dưới.

## Quy ước đã chốt cho nhóm chuỗi giá

Ghi lại vì mỗi chỉ báo dưới đây đều có hơn một cách tính đúng trong sách, và chọn khác đi thì
con số khác đi mà không ai sai:

| Điểm                             | Quy ước của dự án                                                           |
| -------------------------------- | --------------------------------------------------------------------------- |
| Cửa sổ `sessions`/`sample`       | đếm theo **số GIÁ**, nên N giá cho ra N−1 lợi suất                          |
| Độ lệch chuẩn                    | **mẫu** (chia n−1), kể cả trong dải Bollinger                               |
| Lợi suất                         | **giản đơn** `P₁/P₀−1`, riêng "biến động lịch sử" dùng **log** đúng như tên |
| Lãi suất phi rủi ro quy về phiên | **hình học** `(1+r)^(1/m)−1`, không chia thẳng                              |
| Mồi EMA                          | **SMA của n phiên đầu**, nên chuỗi dài đúng n thì EMA trùng SMA             |
| Làm mượt RSI và ATR              | **Wilder** (hệ số 1/n), KHÔNG phải EMA thường 2/(n+1)                       |
| Dao động thực (ATR)              | **bỏ phiên đầu** vì nó chưa có giá đóng cửa trước để so                     |
| Phân vị VaR                      | **nội suy tuyến tính** giữa hai quan sát liền kề                            |
| Độ lệch chuẩn bán phần           | mẫu số là **tổng số lợi suất − 1**, không phải số phiên dưới ngưỡng         |
| Sortino                          | σ_d chia **n** (đúng latex), khác với σ thường chia n−1                     |
| Calmar                           | tử số là **CAGR**, không phải lợi suất bình quân nhân số phiên              |
| Tỷ lệ khối lượng                 | mẫu số là n phiên **liền trước**, không tính phiên cuối                     |

## Còn thiếu

- **Beta.** Đủ 107 công thức nhưng KHÔNG có Beta, trong khi `categories.ts` liệt nó đầu nhóm
  Rủi ro và `capm` phải để beta thành ô nhập tay. Nhóm Rủi ro đã đầy 17/17 nên muốn thêm Beta
  thì phải nâng `expectedCount` lên 18 hoặc bỏ một công thức khác — cần chủ dự án quyết.
- **XIRR** đã có hàm thuần và test đầy đủ trong `returns.ts` nhưng **chưa đăng ký thành công
  thức**: nó cần bảng nhập dòng tiền có ngày, tức gói WBS 3.3.1 (WF-05).
- **Chuỗi kế thừa FR-15 chưa chạy.** `dependsOn` mới khai ở hai chỗ trong `valuation-dcf.ts`,
  còn `inherited()` chưa công thức nào gọi và `ctx.upstream` chưa ai đọc.
- **Chuỗi định giá** Beta → CAPM → WACC → DCF → giá mục tiêu → biên an toàn là gói 5.2.3,
  làm cùng lúc với màn WF-04 (gói 3.2.2).
