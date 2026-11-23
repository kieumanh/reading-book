# Reading Book

Sổ tay theo dõi sách đọc và podcast của Hương Thiền Nature. Bản hiện tại là v1.3.0 tại [reading-book.huongthiennature.com](https://reading-book.huongthiennature.com/).

## Sử dụng

- Chế độ dùng thử dùng sách, podcast và tên tác giả minh họa. Các chỉnh sửa ở chế độ này được lưu trong trình duyệt đang dùng.
- Tạo tài khoản riêng bằng email và mật khẩu để đồng bộ hồ sơ, sách và tiến độ giữa thiết bị. Tài khoản mới có thư viện trống. Tài khoản cũ vẫn đăng nhập bằng tên đã dùng.
- Dùng `Thêm sách` hoặc `Thêm podcast` để nhập tác giả, ảnh bìa, tóm tắt, thể loại và số chương hoặc tập. Có thể lưu liên kết và vị trí dừng.
- Mở một mục để cập nhật tiến độ. Dấu sao đưa mục còn dở lên phần ưu tiên.
- Mở **Hành trình** để xem 111 chặng, huy hiệu, vị trí hiện tại và các lời chúc đã mở. Mỗi chương sách ghi 1 XP và mỗi sách hoàn thành ghi thêm 1 XP. Podcast vẫn được theo dõi ở thư viện riêng. XP đã ghi được giữ khi sửa tiến độ hoặc xóa mục sách. Mỗi cấp từ 1 đến 111 có ngưỡng XP bằng 2^(cấp − 1).
- Trong **Gia sư**, lưu ghi chú theo chương và đặt tên phần sách. Mầm rút ý từ ghi chú, tạo câu hỏi ôn tập, gợi ý sách và trả lời dựa trên dữ liệu đã lưu. Mở **Hoạt cảnh** để xem 56 chuyển động của Mầm.
- **Trí nhớ** lưu tên sách, tác giả và trích dẫn trên trình duyệt. Khi đăng nhập có mạng, tra cứu tự động kiểm tra tối đa hai đầu sách cần cập nhật mỗi lần mở ứng dụng. Tra cứu gửi tên sách và tác giả đến nguồn công khai qua máy chủ. Có thể tắt tự tra cứu hoặc tìm nguồn cho một cuốn theo yêu cầu.
- **Tổng kết tuần** ghi nhận các chương đọc mới, sách hoàn thành và ngày có hoạt động từ lúc phát hành v1.3.0. Tuần tính từ thứ Hai đến Chủ nhật theo giờ Việt Nam.
- Lời nhắc tiếng Việt có thể đóng, mở lại từ chuông hoặc tắt trong cài đặt. Giao diện tự đổi theo giờ thiết bị hoặc có thể giữ sáng, tối.
- Trong Cài đặt → Thông báo hằng tuần, chọn ngày để lời nhắc hiện trong ứng dụng từ 19:00 giờ Việt Nam. Nếu máy chủ có cấu hình Web Push, bạn có thể bật thêm thông báo trên từng trình duyệt.
- Cài ứng dụng từ menu trình duyệt. Khi mất mạng, gia sư có thể dùng ghi chú và nguồn đã lưu trên trình duyệt. Đăng nhập, chỉnh sửa ghi chú tài khoản và đồng bộ cần kết nối.

## Phát triển

Frontend không có bước build. Worker phục vụ tệp tĩnh và API, còn D1 lưu hồ sơ, phiên đăng nhập và thư viện của từng tài khoản. Ảnh tải lên được trình duyệt thu nhỏ trước khi lưu.

```sh
npm run check
npx wrangler d1 migrations apply reading-book --local
npm run dev
```

## Phát hành

Đăng nhập Cloudflare bằng Wrangler và kiểm tra đúng D1 trước khi chạy với `--remote`.

```sh
npx wrangler d1 migrations apply reading-book --remote
npm run deploy
curl --fail https://reading-book.huongthiennature.com/api/health
```

Thông báo trình duyệt dùng cặp khóa VAPID P-256. Lưu JWK riêng vào secret `VAPID_PRIVATE`, khóa công khai dạng điểm P-256 không nén, mã hóa base64url vào `VAPID_PUBLIC`. Giữ nguyên cặp khóa giữa các lần phát hành.

Kiểm tra phiên bản ở phản hồi health, màn hình tổng quan và lần đăng nhập thử. Khi cần khôi phục mã, dùng lịch sử phiên bản của Worker. Mã và dữ liệu D1 có lịch sử khôi phục độc lập; dùng Time Travel của D1 nếu cần khôi phục chính dữ liệu.

Font Be Vietnam Pro, Lora và Dancing Script dùng giấy phép SIL Open Font License. Xem thư mục `licenses`.
