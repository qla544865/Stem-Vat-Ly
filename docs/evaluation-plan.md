# Kế hoạch đánh giá PhyLab 1.0

Trạng thái: **Chưa tiến hành thử nghiệm với học sinh hoặc giáo viên.** Đây là quy trình đề xuất, không phải kết quả nghiên cứu.

## Mục tiêu và người tham gia

Đánh giá khả năng hoàn thành nhiệm vụ, cách hiểu giao diện và giá trị hỗ trợ bài giảng. Mời một nhóm thuận tiện gồm khoảng 6–10 học sinh THPT và 2–3 giáo viên; ghi rõ cách tuyển, số tham gia thực tế và kiến thức nền theo nhóm. Số lượng đề xuất không thay thế thiết kế nghiên cứu thống kê.

Dùng mã phiên ngẫu nhiên; không thu tên, email, điểm học tập, số điện thoại hoặc thông tin nhạy cảm. Thông báo mục đích, quyền dừng bất cứ lúc nào và xin đồng thuận theo quy trình của nhà trường. Không ghi hình hoặc ghi âm mặc định. Người phụ trách nhóm giữ phiếu ở nơi truy cập hạn chế, chỉ chia sẻ bảng tổng hợp ẩn danh; chốt thời hạn lưu/xóa trước khi thu thập.

## Điều kiện chuẩn bị

Ghi phiên bản/commit, URL, trình duyệt, thiết bị, kích thước màn hình, ngày, người quan sát và thời lượng buổi. Kiểm tra build và đường truyền trước buổi. Dùng phiên trình duyệt mới để thử lời mời hướng dẫn. Không xóa sổ tay đang sử dụng của học sinh. Phân biệt thời gian chờ đo mô phỏng với thời gian thao tác; ghi tốc độ phát.

## Quy trình khoảng 20–25 phút

1. Giới thiệu mục đích và cách ghi nhận trong 2 phút, không chỉ sẵn cách giải.
2. Cho tự khám phá 3 phút; người tham gia tự quyết định dùng hướng dẫn hay bỏ qua. Ghi lựa chọn.
3. Giao các nhiệm vụ dưới đây trong 12–15 phút; bắt giờ khi đọc xong nhiệm vụ, dừng khi đạt tiêu chí hoặc hết thời lượng. Không cung cấp đáp án. Nếu hỗ trợ, ghi nguyên văn và thời điểm.
4. Thu phiếu Likert và phản hồi mở trong 3–5 phút.
5. Tổng hợp mức hoàn thành, thời gian, lỗi và phản hồi lặp lại. Ưu tiên sửa theo mức độ; kiểm tra lại vấn đề sau sửa.

| Nhiệm vụ                                | Tiêu chí quan sát                                                                   | Giới hạn đề xuất |
| --------------------------------------- | ----------------------------------------------------------------------------------- | ---------------- |
| Đổi chiều dài con lắc và so sánh chu kỳ | Chỉnh được l, chạy/dừng được, đọc T và mô tả xu hướng                               | 3 phút           |
| Đo 10 dao động và ghi kết quả           | Chọn được mốc, chờ đủ phép đo, ghi được một hàng và mở lại trong Kết quả            | 4 phút           |
| Hoàn thành một Challenge                | Đọc yêu cầu, chỉnh tham số hợp lệ, kiểm tra sau điều kiện, dùng gợi ý nếu cần       | 4 phút           |
| So sánh động lượng trước/sau va chạm    | Chạy tới va chạm, đọc đúng tổng động lượng hai thời điểm và phân biệt với động năng | 3 phút           |
| Giáo viên: trình chiếu một demo         | Nạp demo, vào/thoát Trình chiếu, đọc được số liệu trên máy chiếu thực               | 3 phút           |

Phân loại hoàn thành: độc lập / có hỗ trợ / chưa hoàn thành / không thực hiện. Tách bỏ cuộc, lỗi kỹ thuật và hết giờ. Không ghi nhiệm vụ chưa làm là thất bại. Ghi thời gian từng nhiệm vụ, số lần nhầm thao tác, phần UI gây nhầm và bằng chứng quan sát; không suy diễn động cơ người dùng.

## Nếu so sánh có/không dùng hướng dẫn

Chốt trước cách phân nhóm (ví dụ chia ngẫu nhiên trong các nhóm kiến thức nền tương đương), cùng phiên bản, thiết bị, đề bài, thời lượng và mức hỗ trợ. Nhóm không hướng dẫn tự chọn Bỏ qua, không sửa mô hình vật lý. Tránh cho cùng người làm cùng nhiệm vụ hai lần rồi coi là hai nhóm độc lập; thứ tự tạo hiệu ứng học. Ghi sai lệch quy trình, cỡ mẫu và chênh lệch nền. Khảo sát cảm nhận hoặc mẫu thuận tiện không chứng minh quan hệ nhân quả hay tăng kết quả học tập.

## Quy tắc xử lý phản hồi

| Mức      | Tiêu chí                                             | Hành động                                                              |
| -------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Critical | Không dùng được, mất dữ liệu hoặc kết quả vật lý sai | Chặn nghiệm thu luồng liên quan; tái hiện, sửa tối thiểu và regression |
| High     | Không hoàn thành nhiệm vụ quan trọng                 | Ưu tiên sửa trước buổi đánh giá tiếp theo                              |
| Medium   | Gây nhầm nhưng vẫn hoàn thành                        | Xếp theo tần suất và mức ảnh hưởng                                     |
| Low      | Thẩm mỹ hoặc cải tiến nhỏ                            | Cân nhắc sau các lỗi trên                                              |

Mỗi vấn đề cần mã, bằng chứng, bước tái hiện, tần suất (số phiên/tổng phiên có nhiệm vụ), mức ảnh hưởng, người xử lý và cách xác minh. Không bổ sung mô phỏng hoặc backend trong feature freeze. Dùng [phiếu đánh giá](evaluation-form.md) và [mẫu tổng hợp](evaluation-results-template.md).
