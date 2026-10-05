# CLAUDE.md - Quy ước làm việc cho dự án "Thế Giới Bé Thông Minh"

## Quy ước giao file (bắt buộc)

Mỗi khi hoàn thành một đợt sửa đổi, luôn gửi **2 file zip**:

1. **File cập nhật GitHub** (`cap-nhat-github.zip`)
   - Chỉ chứa các file đã thêm hoặc sửa trong đợt này.
   - Giữ nguyên cấu trúc thư mục (ví dụ `games/ban-no/ban-no.js`, `.github/workflows/deploy-pages.yml`) để người dùng tải đúng chỗ lên GitHub.
2. **File full hoàn chỉnh** (`the-gioi-be-thong-minh-full.zip`)
   - Toàn bộ dự án sau khi sửa, dùng để lưu trữ.

Ghi chú:
- Nếu đợt sửa có XÓA file/thư mục: zip cập nhật GitHub kèm thêm file `XOA-TREN-GITHUB.txt` (liệt kê các mục cần xóa thủ công trên GitHub; file này không đưa lên repo).
- Chỉ để lại 2 file này trong thư mục kết quả, xóa các bản zip cũ để khỏi nhầm.
- Trước khi gửi: kiểm tra cú pháp các file đã sửa và chắc chắn file full đã gồm mọi thay đổi.
- Khi trả lời, nói ngắn gọn file nào dùng để đẩy GitHub, file nào để lưu trữ.
