# Thư viện công thức

Nhánh 5 của WBS. Đủ **108 / 108** công thức.

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
| Chặng `breakdown` cộng lại ĐÚNG bằng kết quả      | `chart.test.ts` — quét mọi CT khai chặng   |
| Diễn giải không mâu thuẫn với chính `spec`        | `src/application/prose-audit.test.ts`      |

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

## Khai `breakdown` — một luật, một cái bẫy

Công thức khai `chartType: 'waterfall'` hoặc `'stackedBar'` thì khai luôn `spec.breakdown`: danh
sách chặng có thứ tự, mỗi chặng một `key` (trỏ vào biến đầu vào HOẶC vào `extras`), một `sign`, và
`shortLabel` cho cột hẹp. Cả **10** công thức thuộc hai nhãn ấy đã khai.

**Luật:** tổng các chặng phải ra đúng KẾT QUẢ của công thức. Không phải xấp xỉ. Một hình bóc tách
cộng không ra con số ở khối Kết quả là hình nói dối về chính phép tính nó minh hoạ, mà từng cột
riêng lẻ vẫn là số hợp lệ nên không ca kiểm nào khác nhìn ra — vì thế `chart.test.ts` có một ca quét
mọi công thức khai chặng.

**Bẫy:** kết quả có phép **chia** hoặc phép nhân hệ số sau phép cộng trừ thì chặng phải là số ĐÃ
QUY ĐỔI, tính sẵn trong `extras`. `ncav-tren-co-phieu` là ca đúng loại: khai thẳng hai ô nhập thì
hai cột mang `tỷ ₫` (4.800 và 2.600) trong khi kết quả mang `₫/CP` (18.644) — lệch bốn chữ số và
lệch cả đơn vị.

Cùng loại bẫy, chiều khác: `lich-tra-no` có kết quả là **một phần** của thứ hiển nhiên đem cộng
(kết quả là tổng lãi, cột chồng gốc + lãi ra tổng phải trả). Lối ra là đảo chiều phép tính —
`tổng phải trả − gốc vay = tổng lãi`.

Nhãn cột tổng suy từ tên công thức (`'EV — giá trị doanh nghiệp'` thành `'EV'`). Tên nào gọi tên
CÔNG VIỆC chứ không gọi tên đại lượng thì khai `spec.breakdownTotal` — nó lợp cả nhãn trục giá trị.

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

Cả ba đã xong — xem [TASK.md](../../../TASK.md) mục "Ba công thức cố ý chưa đăng ký". Mục này
giữ lại làm lịch sử: vì sao mỗi công thức từng kẹt, và vá bằng cách nào.

- ~~**Beta.**~~ Đã đăng ký (`risk-ratios.ts`, id `beta`). Chỗ kẹt cũ KHÔNG phải chỗ ngồi trong
  Registry mà là **dữ liệu** — beta là hệ số hồi quy của lợi suất cổ phiếu theo lợi suất thị
  trường, mà `src/data/samples.ts` từng chỉ có 4 mã và không có chuỗi VN-Index nào để hồi quy
  vào. Vá bằng `DataProvider.vnIndex()` + `CalcContext.marketSeries` (chuỗi giá THỨ HAI, khác
  mọi công thức chuỗi giá khác trong Registry vốn chỉ đọc một mình `ctx.series`). Hạn chế còn
  lại: bộ mẫu vẫn là PRNG độc lập không có nhân tố thị trường chung, nên beta đo trên bộ mẫu ra
  một số gần 0 — đúng về toán, không minh hoạ được một cổ phiếu thật.
- ~~**Giá mục tiêu.**~~ Đã đăng ký (`valuation-multiples.ts`, id `gia-muc-tieu`), độc lập, không
  có cạnh `dependsOn` nào — ứng viên duy nhất `pe → targetPe` bị loại vì P/E hiện tại khác hẳn
  P/E mục tiêu, nối chúng là dạy sai người dùng rằng hai con số đó là một.
- ~~**XIRR.**~~ Đã đăng ký (`returns.ts`, id `xirr`). Hàm thuần `xirr()` vẫn nguyên như trước;
  chỗ khác biệt là công thức DUY NHẤT đọc `ctx.cashflows` thay vì `spec.variables` — bảng dòng
  tiền có độ dài tuỳ ý không phải thứ `VariableSpec` biểu diễn được. Bảng sống trong thân riêng
  `ui/screens/XirrBody.tsx`, state đặt ở `FormulaDetail` (không đặt trong thân riêng) để tránh
  đúng bẫy "hai chỗ tính ra hai số" — xem docblock ở `DetailBodyProps.output`.

## Chuỗi kế thừa FR-15 — đã chạy thật (gói 5.2.3)

Sáu cạnh `dependsOn` của cả Registry đều nằm trong `valuation-dcf.ts`, thành hai nhánh:

```text
capm ──► mo-hinh-gordon.requiredReturn ──► bien-an-toan.intrinsic
capm ──► wacc.costEquity ──► gia-tri-noi-tai-fcff.wacc ◄── fcff.fcff   ·   fcff ──► fcfe.fcff
```

`runChain()` ở `src/core/calc/run-chain.ts` là nơi DUY NHẤT gọi `inherited()` và nơi duy nhất ghi
`ctx.upstream`. Ba luật khi thêm cạnh mới:

- **Đơn vị hai đầu phải khớp** — `formulas.test.ts` chặn. Đổ `300` đơn vị `tỷ ₫` vào một ô đơn vị
  `₫` là sai 9 chữ số mà không cảnh báo nào bắt được.
- **Giá trị mặc định của thượng nguồn phải nằm trong miền của ô nhận** — cũng có ca kiểm. Không
  thì người dùng gặp ô đỏ ngay lượt mở màn đầu tiên.
- **Đừng gọi thẳng `runFormula()` cho công thức trong chuỗi.** Ô móc nối để trống sẽ ra
  `INCOMPLETE_INPUT` — sai nguyên nhân cho một ô người dùng không hề bỏ trống.
