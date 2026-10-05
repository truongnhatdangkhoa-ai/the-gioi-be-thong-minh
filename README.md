# 🌈 Thế Giới Bé Thông Minh

Trò chơi học tập vui nhộn cho bé, chạy thẳng trên trình duyệt, không cần máy chủ, không cần cài thêm gì.

## Cách chạy

1. Giải nén file .zip.
2. Mở thư mục vừa giải nén.
3. Bấm đúp vào file `index.html` (mở bằng Chrome, Edge, Firefox hoặc Safari).

## Các trò chơi

| Trò chơi | Thư mục | Độ khó |
|---|---|---|
| 🎨 Tô màu | `games/to-mau/` | (không chia độ khó) |
| 🧩 Ghép hình | `games/ghep-hinh/` | 🟢 🟡 🔴 |
| 🃏 Lật hình | `games/lat-hinh/` | 50 màn, 5 chặng |
| 🏹 Bắn cung | `games/ban-cung/` | 🟢 🟡 🔴 |
| 🏹 Bắn nỏ (màn hình dọc) | `games/ban-no/` | 10 màn, mỗi màn 2 phút |
| 🏎️ Đua xe | `games/dua-xe/` | 🟢 🟡 🔴 |
| 🍭 Tiệm kẹo – bánh – kem | `games/tiem-keo-banh-kem/` | (không chia độ khó) |

## Các file dùng chung (thư mục `js/`)

- `luu-tru.js` – nơi DUY NHẤT đọc/ghi dữ liệu (localStorage). Mọi trò chơi đều lưu qua đây.
- `diem-so.js` – điểm, sao, cấp độ. Đúng 1 câu: +10 điểm. Đúng 3 câu liên tiếp: thưởng +5 điểm. Chơi xong: +5 sao. Không bao giờ trừ điểm.
- `thanh-tich.js` – danh sách thành tích. Muốn thêm thành tích: thêm 1 dòng vào `DANH_SACH`.
- `am-thanh.js` – âm thanh tạo bằng trình duyệt (không cần file âm thanh), có nút bật/tắt.
- `app.js` – thanh điểm phía trên, hộp thoại, màn Thành tích, Cài đặt, hiệu ứng pháo giấy.
- `tro-choi-chung.js` – màn chọn độ khó, màn kết quả và các hàm dùng chung cho trò chơi.
- `trang-chu.js` – vẽ trang chủ.

## Sửa nội dung nhanh

- Thêm bức hình ghép: sửa mảng `BUC_HINH` trong `games/ghep-hinh/ghep-hinh.js`.
- Đổi màu, tên trò chơi trên trang chủ: sửa `DANH_SACH_TRO_CHOI` trong `js/app.js`.

## Lật hình

- 50 màn chia 5 chặng, mỗi chặng 10 màn (2 đến 24 cặp thẻ). Xong màn trước mới mở màn sau. Xong màn cuối của chặng thì mở thêm 10 màn mới.
- Mỗi màn chấm 1–3 sao theo số lượt lật. Bé chọn chủ đề: Ngẫu nhiên, Con vật, Hoa, Cây trái; hình bốc ngẫu nhiên mỗi lần chơi.
- Thêm chặng: thêm một dòng vào mảng `CHANG` trong `games/lat-hinh/lat-hinh.js` (10 số cặp + 10 thời gian xem trước).
- Thêm hình: chép ảnh vuông vào `assets/images/` rồi thêm dòng `{ id, ten, nhom }` vào `hinh-lat.js` (id trùng tên file).

## Bắn cung

- Bé chạm vào màn hình, **kéo dây cung về phía sau rồi thả tay**: kéo càng xa mũi tên bay càng mạnh, hướng bắn ngược với hướng kéo. Có chấm ngắm; mức Khó chấm ngắm ngắn hơn.
- Bóng xuất hiện ngẫu nhiên, 4 loại: **bóng thú bông** (gấu, thỏ, cừu, heo...), bóng màu, bóng trái tim, bóng sao vàng (nhỏ, bay nhanh, thưởng thêm 10 điểm). Bắn trúng bóng thú bông thì thú bông rơi ra và vào "bộ sưu tập" trên thanh thông tin.
- Trúng 1 bóng: +10 điểm, 3 bóng liên tiếp: thưởng +5 (dùng chung `diem-so.js`). Bắn trượt chỉ mất chuỗi thưởng, không trừ điểm. Số bóng cần trúng: 8 / 12 / 16 theo độ khó. Sao chấm theo số mũi tên đã dùng.
- Chỉnh độ khó: sửa `CAU_HINH_DO_KHO` trong `games/ban-cung/ban-cung.js`. Thêm thú bông: chép ảnh vào `assets/images/` rồi thêm dòng `{ id, ten }` vào `THU_BONG`.

## Bắn nỏ (màn hình dọc)

- Nỏ đứng giữa phía dưới màn hình. Bé **chạm vào chỗ muốn bắn**: nỏ xoay theo ngón tay và bắn ngay; **giữ tay thì bắn liên tục**, trượt ngón tay để quét hướng bắn. Mũi tên không giới hạn. Trên máy tính có thể dùng phím ← → để xoay và phím cách để bắn. Có nút ⏸️ tạm dừng.
- Bóng và vật phẩm rơi từ trên xuống: **bóng tròn** (+5), **bong bóng thú bông** (+10), **trái tim** (+10), **trái cây** (+10), **sao vàng** (+20, nhỏ và nhanh).
- **Quà** 🎁 rơi xuống, bắn trúng được: **+5**, **+10**, **+20 điểm**, hoặc phép màu kéo dài **10 giây**: 🏹 **bắn 3 mũi tên một lượt**, ✨ **điểm nhân đôi**, ⚡ **mũi tên xuyên** qua mọi vật. Phép màu hiện trên thanh thông tin kèm đồng hồ đếm ngược.
- **10 màn, mỗi màn chơi đúng 2 phút**, mỗi màn một **bố cục rơi** và một **mục tiêu điểm** khác nhau. Hết giờ mà đủ điểm thì qua màn và mở màn kế tiếp; chưa đủ thì chơi lại (không bị trừ điểm). Sao chấm theo điểm: 1 sao = đạt mục tiêu, 2 sao = 140%, 3 sao = 180%.
- 10 bố cục: Mưa bóng (rơi ngẫu nhiên) · Ba làn · Hàng ngang (5 vật cùng lúc) · Lắc lư · Chữ V · Hai bên (bay chéo vào giữa) · Vòng xoáy · Sao băng (chéo, nhanh) · Năm làn (mỗi làn một tốc độ) · Đại tiệc (trộn tất cả).
- Chỉnh màn: sửa mảng `MAN` ở đầu `games/ban-no/ban-no.js` (`mucTieu` điểm qua màn, `toc` tốc độ rơi, `nhip` thời gian giữa 2 đợt, `co` cỡ vật, `boCuc`, `tiLe` tỉ lệ từng loại vật, `nen` màu nền). Thêm kiểu bố cục: thêm một hàm vào `BO_CUC` (trả về danh sách vật với vị trí và chuyển động).
- Chỉnh quà: sửa mảng `QUA` (trọng số càng lớn càng hay rơi) và `THOI_GIAN_QUA`. Chỉnh điểm từng loại vật: `DIEM`.
- **Ảnh nền riêng cho từng màn**: chép ảnh vào `games/ban-no/` rồi ghi tên file vào `anhNen` của màn đó (ví dụ `anhNen: 'nen-man-1.jpg'`). Ảnh tự phủ kín sân khấu; để `null` thì dùng nền vẽ đơn giản. Nên dùng ảnh dọc, tỉ lệ khoảng 9:16 (ví dụ 1080×1920).
- Ảnh nỏ và mũi tên: `games/ban-no/no.png`, `games/ban-no/mui-ten.png` (đã tách nền; mũi tên có đầu bi vàng hướng lên). Thay file cùng tên là đổi hình.
- Thử nhanh: thêm `?gio=15` vào địa chỉ trang để mỗi màn chỉ chơi 15 giây.
- Thành tích mới: Thợ săn bắn nỏ, Thần nỏ (qua cả 10 màn).

## Đua xe

- Bé chọn xe (8 xe), rồi lái xe chạy trên đường nhiều làn (3 làn ở mức Dễ / Trung bình, 4 làn ở mức Khó). **Chạm hoặc kéo ngón tay vào làn đường** để đổi làn; cũng có nút ⬆️ ⬇️ và phím mũi tên (hoặc W / S). Có đếm ngược 3-2-1-Đi trước khi xe chạy.
- Vật cản: các bạn con vật đứng giữa đường, nón giao thông và (từ mức Trung bình) xe chạy ngược chiều. Mỗi đợt vật cản luôn chừa ít nhất một làn trống. Hàng ⭐ xuất hiện ở làn trống.
- Nhặt 1 sao: +10 điểm, 3 sao liên tiếp thưởng +5 (dùng chung `diem-so.js`). Về đích: +10 điểm. **Đụng vật cản không trừ điểm**: xe chỉ chậm lại một chút, mất chuỗi thưởng. Sao chấm theo số lần va chạm (0 lần = 3 sao, 1–2 lần = 2 sao, nhiều hơn = 1 sao).
- Chỉnh độ khó: sửa `CAU_HINH_DO_KHO` trong `games/dua-xe/dua-xe.js` (số làn, tốc độ, độ dài đường đua, khoảng cách giữa các đợt vật cản, tỉ lệ xe ngược chiều). Thêm xe: chép ảnh (đầu xe quay sang TRÁI, game tự lật lại khi vẽ) vào `assets/images/` rồi thêm dòng `{ id, ten }` vào `XE`. Thêm vật cản: thêm dòng `{ id, ten, cao }` vào `VAT_CAN`.
- Thành tích mới: Tay lái lụa, Lái xe an toàn, Tay đua siêu hạng.
- Ảnh cây ven đường là bản đã tách nền riêng cho game này, nằm ngay trong `games/dua-xe/` (`cay-dua.png`, `cay-cam.png`, `cay-xoai.png`).

## Tô màu

- 19 tranh nằm trong `games/to-mau/tranh-to-mau.js`, nhúng sẵn dạng ảnh PNG để tô được khi mở thẳng `index.html`.
- Tranh mới nên là nét đen nền trắng, hình vuông, nét liền kín.

## Icon trò chơi

Icon nằm ở `assets/icons/tro-choi/<id>.png` (nền trong suốt). Thay file cùng tên là đổi icon.

## Toàn màn hình

- Khung trò chơi tràn hết cửa sổ, tự co giãn theo cỡ màn hình (`css/toan-man-hinh.css`, nạp cuối cùng trong mỗi trang trò chơi).
- Nút 🖥️ **Toàn màn hình** nằm trên thanh điểm (mã ở `js/app.js`, mục "Toàn màn hình"). Trình duyệt tự thoát toàn màn hình khi chuyển trang, nên lựa chọn của bé được nhớ (`caiDat.toanManHinh`) và tự vào lại ở lần chạm đầu tiên trên trang mới.
- iPhone Safari không hỗ trợ toàn màn hình cho trang web nên nút tự ẩn.

## Ghi chú

- Dữ liệu chỉ lưu trên máy đang chơi. Xóa dữ liệu trình duyệt thì tiến trình cũng mất.
- Muốn chơi lại từ đầu: Trang chủ → ⚙️ Cài đặt → 🧹 Chơi lại từ đầu.
- Dự án chỉ dùng HTML, CSS, JavaScript thuần nên có thể đóng gói bằng Capacitor sau này.

## Ảnh trong trò chơi

- Toàn bộ hình minh họa nằm ở `assets/images/<id>.png` (ảnh do bạn cung cấp, nền đã làm trong suốt). Trong code, viết `':id:'` (ví dụ `':cho:'`) ở chỗ cần hình; `js/anh.js` tự đổi thành ảnh.
- Ghép hình dùng ảnh dựng sẵn ở `assets/images/ghep/<id>.png`; Lật hình dùng chung ảnh ở `assets/images/`.
- Tô màu vẫn dùng tranh nét đen cũ (bộ ảnh mẫu không có tranh tô).

## Tiệm kẹo – bánh – kem

- Dành cho bé chưa biết chữ: chọn bằng hình, có âm thanh và hiệu ứng, không có thua, không trừ điểm.
- Ba quầy: 🍭 **Kẹo** (kiểu kẹo → màu → hình dạng → topping → máy làm kẹo), 🍰 **Bánh** (cho trứng, sữa, bột, đường vào tô bằng cách chạm hoặc kéo thả → trộn → nướng → trang trí → xong), 🍦 **Kem** (kiểu kem → vị → ốc quế / ly / cốc → topping → xong).
- Ở quầy Bánh có 2 món "lạ" (🧦, 🐟): cho vào thì tô chỉ lắc đầu nhẹ, bé chọn lại.
- Làm xong một món: +10 điểm, +5 sao, mở thành tích "Đầu bếp nhí". Số món đã làm hiện trên thẻ trang chủ.
- Thêm màu, vị kem, topping: sửa các mảng `MAU_KEO`, `VI_KEM`, `TOPPING_KEO`, `TOPPING_KEM`, `TRANG_TRI_BANH` ở đầu file `games/tiem-keo-banh-kem/tiem-keo-banh-kem.js`. Hình món ăn được vẽ bằng SVG trong `ve-mon.js`.
