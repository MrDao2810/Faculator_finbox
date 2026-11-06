/**
 * Tên doanh nghiệp và tên ngành bằng tiếng Anh, cho chế độ EN (05/11/2026).
 *
 * Chủ dự án chuyển sang tiếng Anh, mở "Load a sample dataset" và "Pick a ticker", thấy
 * "Vàng Bạc Đá quý Phú Nhuận · Bán lẻ", "Thủy sản Mekong": _"tại sao chuyển sang tiếng anh mà vẫn
 * còn tiếng việt, lỗi nghiêm trọng"_. Trước đó tên doanh nghiệp và tên ngành CỐ Ý để tiếng Việt ở
 * chế độ EN ("source data, like proper nouns" trong CLAUDE.md) — điều ấy bị đảo.
 *
 * File này chỉ được nạp qua `import()` trong `loadLocale('en')`, cùng lúc với từ điển tiếng Anh:
 * người dùng tiếng Việt không tải nó, và màn đổi sang tiếng Anh một lượt, tên doanh nghiệp đã có
 * sẵn (`PreferencesProvider` chỉ đổi `locale` khi `loadLocale` xong).
 */

import { TICKER_NAMES_EN } from '@/data/ticker-names-en.generated';

/** Dấu tiếng Việt, kể cả đ — cùng bảng với `scripts/gen-ticker-names-en.mjs`. */
const CO_DAU = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

function boDau(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Tên tiếng Anh của một mã.
 *
 * Mã có trong bảng sinh thì lấy bảng. Mã không có dòng nào là một trong hai trường hợp: tên Finbox
 * vốn không dấu ("Sacombank", "FPT Corp") — in nguyên; hoặc mã mới niêm yết sau lần sinh bảng — in
 * tên BỎ DẤU, đúng bậc cuối của script sinh. Không bao giờ in tên có dấu ở chế độ EN.
 */
export function companyNameEn(code: string, name: string): string {
  const tuBang = TICKER_NAMES_EN[code.trim().toUpperCase()];
  if (tuBang !== undefined) return tuBang;
  return CO_DAU.test(name) ? boDau(name.replace(/^(công ty cổ phần|ctcp)\s+/i, '')) : name;
}

/**
 * Tên ngành của Finbox (`industry` trong `/data/symbols`, và các mục tên ngành của `/bp/codes`) bằng
 * tiếng Anh. Viết tay — Finbox không có bản tiếng Anh. Đủ 71 ngành của `/bp/codes` ngày
 * 05/11/2026; `ten-tieng-anh.test.ts` ghim nó và đòi mọi ngành của bộ mẫu (`LIVE_TICKER_META`) có
 * dòng ở đây.
 *
 * Dịch theo các công ty THẬT trong ngành, không chỉ theo chữ (06/11/2026, tra `/data/symbols` cho cả
 * danh sách mã): "Hàng không" có cả cảng hàng không (ACV) và dịch vụ mặt đất (SCS, SGN, NAS) nên là
 * 'Aviation', không phải 'Airlines'; "Dịch vụ kho bãi" phần lớn là cảng biển (Cát Lái, Gemadept);
 * "Đồ uống & Giải khát" là cà phê, chè, nước khoáng (bia và rượu có ngành riêng); "Tiện ích cộng đồng"
 * chỉ có UPC (cây xanh đô thị), nên 'Public utilities' (điện, nước) là sai; "Công nghiệp phức hợp" là que
 * hàn, Siba, tức 'Diversified industrials' của ICB. 'Equipment & hardware' giữ nguyên vì ngành ấy có cả
 * lưới dệt (SFN), vật tư mỏ (MTS), không chỉ phần cứng công nghệ.
 */
export const INDUSTRY_NAMES_EN: Readonly<Record<string, string>> = {
  'Bán lẻ': 'Retail',
  'Bánh kẹo': 'Confectionery',
  'Bao bì đóng gói': 'Packaging',
  'Bảo hiểm': 'Insurance',
  'Bất động sản': 'Real estate',
  'Bất động sản công nghiệp': 'Industrial real estate',
  'Bến xe khách': 'Bus stations',
  Bia: 'Beer',
  'Cao su': 'Rubber',
  'Chất thải & Môi trường': 'Waste management & environmental services',
  'Chứng khoán': 'Securities brokerage',
  'Công nghiệp phức hợp': 'Diversified industrials',
  'Dầu khí': 'Oil & gas',
  'Dệt may': 'Textiles & apparel',
  'Dịch vụ giải trí': 'Entertainment services',
  'Dịch vụ kho bãi': 'Warehousing & port services',
  'Dịch vụ tài chính': 'Financial services',
  'Dược phẩm': 'Pharmaceuticals',
  'Đào tạo & Việc làm': 'Education & employment services',
  Điện: 'Power',
  'Điện tử & Thiết bị điện': 'Electronics & electrical equipment',
  'Đồ uống & Giải khát': 'Non-alcoholic beverages',
  Đường: 'Sugar',
  'Đường sắt': 'Railways',
  'Gạch ốp lát': 'Wall & floor tiles',
  'Giầy dép': 'Footwear',
  'Hàng cá nhân': 'Personal goods',
  'Hàng gia dụng': 'Household goods',
  'Hàng không': 'Aviation',
  'Hóa chất': 'Chemicals',
  'Khách sạn': 'Hotels',
  'Khai khoáng': 'Mining',
  'Khai thác đá': 'Quarrying',
  'Kim loại': 'Metals',
  'Lâm nghiệp': 'Forestry & wood products',
  'Máy công nghiệp': 'Industrial machinery',
  'Ngân hàng': 'Banking',
  'Nguyên liệu chế biến': 'Raw material processing',
  Nhựa: 'Plastics',
  'Nông nghiệp & Chăn nuôi': 'Agriculture & livestock',
  Nước: 'Water supply',
  'Ô tô': 'Automobiles',
  'Phân bón': 'Fertilizers',
  'Phần mềm & DV máy tính': 'Software & IT services',
  'Quỹ đầu tư': 'Investment funds',
  Rượu: 'Wine & spirits',
  'Sách & Sản phẩm văn hóa': 'Books & cultural products',
  'Săm lốp': 'Tires',
  'Sản xuất bê tông': 'Concrete',
  'Sản xuất gạch': 'Bricks',
  'Sản xuất giấy': 'Paper',
  'Sơn & Chất phủ': 'Paints & coatings',
  Sữa: 'Dairy',
  Than: 'Coal',
  Thép: 'Steel',
  'Thiết bị & Dịch vụ y tế': 'Medical equipment & services',
  'Thiết bị & Phần cứng': 'Equipment & hardware',
  'Thuốc lá': 'Tobacco',
  'Thuốc trừ sâu': 'Pesticides',
  'Thủy sản': 'Seafood',
  'Thực phẩm': 'Food products',
  'Tiện ích cộng đồng': 'Community services',
  'Truyền thông': 'Media',
  'Tư vấn & Hỗ trợ Kinh doanh': 'Consulting & business support services',
  'Vận tải': 'Transportation',
  'Vận tải khách & Du lịch': 'Passenger transport & tourism',
  'Vật liệu xây dựng': 'Building materials',
  'Viễn thông': 'Telecommunications',
  'Xây dựng': 'Construction',
  'Xe tải & Đóng tàu': 'Trucks & shipbuilding',
  'Xi măng': 'Cement',
};

/**
 * Tên ngành tiếng Anh, `undefined` khi bảng chưa có ngành này (Finbox thêm ngành mới sau 05/11/2026).
 * Bên gọi BỎ tên ngành đi thay vì in bản tiếng Việt: tên ngành chỉ là thông tin phụ cạnh tên doanh
 * nghiệp, thiếu nó không sai gì, còn in tiếng Việt giữa màn tiếng Anh là đúng lỗi vừa sửa.
 */
export function industryNameEn(industry: string): string | undefined {
  return THEO_KHOA.get(khoaNganh(industry));
}

/**
 * Khoá so khớp tên ngành. `/data/symbols` viết cùng một ngành nhiều kiểu (đo 06/11/2026): 'ĐIện' (S4A),
 * 'Điện tử & thiết bị điện' (HPO), 'Sách & sản phẩm văn hóa' (KHX), và 'Bất động sản' ở dạng Unicode
 * tổ hợp (SLD). So nguyên văn thì bốn mã ấy mất tên ngành ở chế độ tiếng Anh; nên so sau khi chuẩn
 * hoá NFC, bỏ khoảng trắng thừa và hạ chữ thường.
 */
function khoaNganh(industry: string): string {
  return industry.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
}

const THEO_KHOA: ReadonlyMap<string, string> = new Map(
  Object.entries(INDUSTRY_NAMES_EN).map(([vi, en]) => [khoaNganh(vi), en]),
);
