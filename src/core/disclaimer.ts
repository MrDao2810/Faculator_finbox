/**
 * Tầng DOMAIN — câu miễn trừ trách nhiệm (FR-24).
 *
 * Để riêng một file chỉ có một hằng số, không import gì cả, vì hai nơi dùng nó rất khác nhau:
 *   · dải miễn trừ trên MỌI màn, qua từ điển i18n;
 *   · câu đính vào MỌI file xuất, qua `buildExportContent()`.
 *
 * Để riêng cho đúng chiều phụ thuộc: từ điển i18n chỉ cần một chuỗi, không có lý do gì phải
 * import cả bộ dựng nội dung file xuất (và qua đó là validator Registry). Đo `npm run build`
 * thì bundle không đổi — Turbopack tree-shake được — nhưng phụ thuộc thừa vẫn là phụ thuộc
 * thừa, và nó sẽ thành thật khi `export-content.ts` lớn dần.
 *
 * FR-24 xếp vào nhóm "không bao giờ được cắt" của SRS, cùng với FR-06 và NFR-USA-01.
 */
export const DISCLAIMER_VI = 'Kết quả chỉ mang tính tham khảo, không phải khuyến nghị đầu tư.';

/**
 * Câu ghi rõ ĐẦU VÀO là số liệu bản thảo — đính vào file xuất và file CSV khi người dùng
 * đang dùng bộ số liệu mẫu tự dựng (`Preset.isDraft`).
 *
 * Tách khỏi `DISCLAIMER_VI` vì hai câu nói hai chuyện: miễn trừ nói kết quả chỉ để tham khảo
 * (luôn đúng, không tắt được); câu này nói nguồn số liệu chưa được đối chiếu (chỉ đúng khi bộ
 * mẫu còn là bản thảo, và sẽ tự biến mất khi có số liệu thật).
 */
export const DRAFT_DATA_NOTE_VI =
  'Số liệu đầu vào lấy từ bộ mẫu tự dựng, chưa đối chiếu báo cáo thật.';
