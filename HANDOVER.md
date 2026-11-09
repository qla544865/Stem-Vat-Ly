# PHYLAB — BÀN GIAO PHASE 2A

**Ngày lập** 09/11/2026

## Phạm vi

Bàn thí nghiệm **Con lắc đơn** mở từ trang chủ và menu nhóm ở `#/pendulum`. Sandbox có slider, kéo thả bằng chuột hoặc cảm ứng, Play/Pause/Reset và tốc độ 0,5×, 1×, 2×. Phiếu thực hành đi từ dự đoán qua chọn mốc, đo 10 dao động, ghi bảng và nhập nhận xét. Gợi ý kết luận mở sau khi ghi đủ mốc của từng bài. Trang kết quả có đồ thị T–A, T–m, T–l, T²–l và phép suy ra g. Chế độ trình chiếu phóng to Canvas và số liệu, đồng thời giữ thanh chuyển chế độ khi cuộn.

| Phần                                                                   | File                                                                                      |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Mô hình, năng lượng và chu kỳ đối chiếu                                | `src/simulations/pendulum/physics.ts`                                                     |
| Trạng thái chạy, phát hiện mốc, cấu hình bài, ghi và phân tích số liệu | `src/simulations/pendulum/experiment.ts`                                                  |
| Vẽ Canvas và xử lý kéo thả                                             | `src/simulations/pendulum/renderer.ts`, `src/simulations/pendulum/PendulumSimulation.tsx` |
| Điều phối chế độ và phiếu, bảng, đồ thị                                | `src/components/PendulumLab.tsx`, `src/components/PendulumResults.tsx`                    |
| Hạ tầng dùng chung                                                     | `useSimulation`, `CanvasSurface`, `SimulationControls`, `ControlPanel`                    |
| Sổ tay phiên và đường dẫn                                              | `src/App.tsx`, `src/navigation.ts`, `src/simulations/catalog.ts`                          |

Một vòng RAF của `useSimulation` truyền thời gian vật lý tuyệt đối cho `PendulumRun`. Solver tiến theo số bước nguyên đã đến hạn và giữ phần lẻ ngầm trong thời gian của đồng hồ. Canvas đọc trạng thái từ solver. Cùng cơ chế hiện có xử lý Pause/Resume, tab ẩn và gián đoạn trên 250 ms. Đồ thị SVG lấy trục hoành từ tham số của phép đo, còn đồ thị dùng chung của Phase 1 tiếp tục phục vụ các mô hình cũ.

## Mô hình và phép đo

- Vật nặng là chất điểm, dây nhẹ không dãn với l cố định trong mỗi lần chạy. Trọng trường đều, chuyển động phẳng và bỏ qua lực cản. Góc dương về bên phải. Mô hình dùng SI, giao diện đổi sang cm, g và độ khi cần.
- Tích phân hệ θ′ = ω, ω′ = −(g/l) sin θ bằng RK4 với bước cố định 1/240 s. Kiểm tra cơ năng bằng E = ½m(lω)² + 2mgl sin²(θ/2). Khối lượng không tham gia phương trình gia tốc góc.
- T₀ = 2π√(l/g) là chu kỳ gần đúng ở góc nhỏ. Chu kỳ phi tuyến T = 4√(l/g) K(sin(|α₀|/2)) được đối chiếu qua trung bình số học–hình học. [NIST DLMF, công thức 19.8.5](https://dlmf.nist.gov/19.8.E5)
- Thả từ θ = α₀, ω = 0. Đếm khi ω đổi dấu tại biên cùng phía thả. Lần thứ 10, nội suy thời điểm ω = 0 giữa hai bước, dừng ở biên và tính T đo = t₁₀/10. Tốc độ phát chỉ đổi thời gian chờ ngoài đời.
- A là độ lớn độ lệch ngang. Với l = 50 cm, các mốc A = 3, 6, 9, 18 cm cho góc thả khoảng 3,44°, 6,89°, 10,37°, 21,10°. Kéo ở bài biên độ chọn mốc gần nhất trên phía kéo. Hai bài còn lại khóa góc thả 5°.
- Bảng chiều dài hiển thị T²/l theo s²/cm. Fit dùng mét và b = Σ(lᵢTᵢ²)/Σ(lᵢ²) với hệ số chặn bằng 0. Sau đó g = 4π²/b. Ba chiều dài 40, 50, 60 cm cho b ≈ 4,03225 s²/m và g ≈ 9,791 m/s². Độ lệch so với 9,8 m/s² đến từ việc dùng công thức góc nhỏ để phân tích số đo phi tuyến ở góc 5°.

## Kiểm chứng Phase 2A

| Kiểm tra                                | Kết quả                                                                                                                                                                                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline trước sửa                      | 48/48 test và production build đạt                                                                                                                                                                                                                       |
| Test tự động sau sửa                    | 60/60 đạt, gồm 12 test mới cho con lắc và route                                                                                                                                                                                                          |
| Độ chính xác số                         | Tại l = 1 m, g = 9,8 m/s² và α₀ = 1°, T₀ ≈ 2,007090 s và T phi tuyến ≈ 2,007128 s. Ở tám tổ hợp biên thử nghiệm, sai lệch T đo so với T phi tuyến dưới 1,5 × 10⁻⁸ s. Sai lệch cơ năng tương đối lớn nhất quan sát được khoảng 1,1 × 10⁻⁶ sau 100 chu kỳ. |
| Đồng hồ                                 | Cùng t₁₀ ở các cặp 30 FPS/0,5×, 60 FPS/1× và 144 FPS/2×. Đã kiểm tra nửa chu kỳ, Pause/Resume, Reset, gián đoạn, đổi mốc giữa phép đo và chặn ghi sớm.                                                                                                   |
| Chromium trên bản production `/phylab/` | Đã chạy cả 10 mốc và tám Challenge Phase 1, kiểm tra chuột và cảm ứng giả lập, ẩn/hiện tab, fit g, đường lý thuyết, xác nhận xóa và điều hướng.                                                                                                          |
| Bố cục                                  | Kiểm tra 1366×768, 1920×1080, 800×900 và 390×844. Thanh Play/Pause nằm trong khung hình trình chiếu 1366×768.                                                                                                                                            |
| Build                                   | `pnpm build` đạt và tạo `dist/`.                                                                                                                                                                                                                         |

## Demo con lắc đơn trước lớp

1. Chạy `pnpm install` và `pnpm dev`. Mở địa chỉ Vite in ra, chọn **Con lắc đơn** và bật **Trình chiếu**.
2. Kéo quả nặng ra góc lớn. So sánh T₀ với T phi tuyến, rồi cho lớp quan sát điều gì xảy ra khi chỉ tăng khối lượng.
3. Trong **Thực hành**, chọn **Chiều dài** và mời lớp dự đoán. Chọn 2×, đo rồi ghi từng hàng 40, 50 và 60 cm. Tạm dừng một lần để minh họa đồng hồ thời gian vật lý.
4. Chuyển sang **Kết quả & đồ thị**. So sánh T–l với T²–l, bật/tắt đường lý thuyết và đọc g suy ra. Trong tiết thực hành đầy đủ, cho học sinh hoàn thành thêm bốn mốc biên độ và ba mốc khối lượng rồi mở gợi ý kết luận.

## Giới hạn

- Mô hình lý tưởng có miền Sandbox l = 20–150 cm, m = 20–200 g, |α₀| = 1–60° và g = 1,6–20 m/s². Dữ liệu đo có tính xác định. Không có mô hình lực cản hay sai số dụng cụ.
- Kết quả đã ghi, dự đoán và nhận xét nằm trong bộ nhớ React của phiên. Đổi trang hoặc chế độ giữ sổ tay trong cùng phiên. Tải lại trang xóa sổ tay. Phép đo đang chạy bị đặt lại khi đổi mốc hoặc rời mô phỏng sang bàn khác.
- Nội dung ba bài dựa trên phiếu và các mốc được mô tả trong yêu cầu. Phiên bàn giao đã kiểm tra giao diện bằng Chromium và cảm ứng giả lập.

---

# PHYLAB — BÁO CÁO BÀN GIAO GIAI ĐOẠN 1

**Ngày lập:** 03/11/2026  
**Dự án:** PhyLab — STEM vật lý 11C5  
**Phiên bản trong package.json:** 0.1.0  
**Thư mục bàn giao:** `C:\dat\khkt\stem\vat-ly\PhySim`  
**Trạng thái:** Đã triển khai và kiểm thử giai đoạn 1; sẵn sàng demo local. Chưa publish lên hosting công khai.

## 1. Tóm tắt dùng để báo cáo

PhyLab giai đoạn 1 đã được phát triển trên nền prototype hiện có, sử dụng React, TypeScript và Vite. Sản phẩm có trang chủ chọn ba nhóm thí nghiệm: lò xo và dao động, moment lực và cân bằng, chuyển động tròn với hình chiếu dao động điều hòa. Mỗi nhóm có Sandbox và Challenge Lab; tổng cộng có tám thử thách. Thí nghiệm ném ngang cùng các chức năng cũ được giữ lại. Các công thức vật lý được tách khỏi phần vẽ, mô phỏng động dùng chung một đồng hồ và có Play/Pause/Reset, điều chỉnh tốc độ, đồ thị và công thức. Kết quả ghi nhận: 48 bài test đạt, production build và kiểm tra định dạng thành công; cả tám thử thách đã được kiểm thử trực tiếp trong trình duyệt. Bản production đã chạy thử dưới subpath `/phylab/`. Bước tiếp theo là lựa chọn hosting và tổ chức demo/nghiệm thu với giáo viên.

## 2. Phạm vi đã bàn giao

| Hạng mục         | Nội dung đã hoàn thành                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Trang chủ        | Ba card thí nghiệm chính, mô tả, minh họa SVG, nút mở thí nghiệm; lối vào ném ngang cũ                                     |
| Hooke tĩnh       | Điều chỉnh k và ngoại lực F; giãn/nén có dấu; chiều dài tự nhiên, thước đo, hai vector lực; đồ thị F–Δl                    |
| Dao động lò xo   | Điều chỉnh m, k, A, pha ban đầu φ; vector vận tốc/gia tốc bật tắt riêng; x, v, a, T, f và các đại lượng bổ sung            |
| Đồ thị lò xo     | Chọn x(t), v(t), a(t); trục và đơn vị riêng, lưới và dấu chỉ thời gian                                                     |
| Moment lực       | Hai lực hướng xuống, cánh tay đòn, điểm tựa O, M₁/M₂, chênh lệch moment và xu hướng quay; biểu đồ so sánh                  |
| Chuyển động tròn | Quỹ đạo, bán kính, góc quay, vận tốc tiếp tuyến, gia tốc/lực hướng tâm, chu kỳ                                             |
| Hình chiếu       | Khung chuyển động tròn bên trái và hình chiếu trên trục x bên phải; cùng thời gian và pha, A = r; đường nối và đồ thị x(t) |
| Sandbox          | Chỉnh tham số trong giới hạn, khôi phục mặc định, công tắc vector/chú thích, thông tin và giải thích vật lý                |
| Challenge Lab    | Tám bài có nhiệm vụ, giới hạn tham số, điều kiện kiểm tra, gợi ý, giải thích đúng/sai và thao tác thử lại                  |
| Ném ngang        | Giữ mô phỏng, hai thử thách cũ, điều khiển thời gian, quỹ đạo, vector vận tốc và dừng tại mặt đất                          |
| Giao diện        | Desktop có panel bên phải; tablet/màn hình nhỏ đưa panel xuống dưới; Canvas tự thay đổi kích thước và độ phân giải         |
| Hosting tĩnh     | Build ra `dist/`, tài nguyên tương đối, hash navigation; đã thử chạy dưới subpath                                          |
| Tài liệu         | README hướng dẫn chạy, sử dụng, cấu trúc, chỉnh tham số, bổ sung Challenge, build và deploy                                |

Hooke và moment là **mô hình tĩnh**, phản hồi ngay khi kéo slider. Không thêm chuyển động quay tùy ý cho thanh hoặc nút Play không có ý nghĩa vật lý.

## 3. Danh sách thử thách và tiêu chí đạt

| ID            | Tên                 | Điều kiện đạt                                                                              |
| ------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `secret`      | Độ cứng bí mật      | Thay đổi F khác 0, quan sát Δl, nhập k đúng trong ±5%. Không cho kiểm tra từ phép đo F = 0 |
| `period`      | Đạt chu kỳ mục tiêu | Điều chỉnh m/k và chạy; T = 2 s ± 0,05 s                                                   |
| `mass`        | Khối lượng & chu kỳ | Dự đoán chu kỳ tăng hai lần; tăng m từ 0,5 lên 2 kg và kiểm chứng tỉ số T₂/T₁              |
| `balance`     | Cân bằng thanh      | Điều chỉnh d₂; độ lớn chênh lệch moment không quá 0,10 N·m. Nghiệm mẫu: d₂ = 2 m           |
| `centripetal` | Gia tốc hướng tâm   | Điều chỉnh r/ω và chạy; aₕₜ = 18 m/s² ± 0,20 m/s²                                          |
| `projection`  | Dự đoán hình chiếu  | Chọn đáp án trước khi chạy từ φ = 0; dừng đúng T/4 và đối chiếu x = 0                      |
| `target`      | Bắn trúng mục tiêu  | Chỉnh v₀, chờ chạm đất; tầm xa cách 18 m không quá 0,50 m                                  |
| `predict`     | Dự đoán tầm xa      | Nhập dự đoán trước khi chạy; kiểm tra sau khi chạm đất, sai lệch không quá 0,50 m          |

Năm bài theo yêu cầu giai đoạn 1 là `secret`, `period`, `balance`, `centripetal`, `projection`. Ba bài còn lại được giữ từ prototype. `period` cũng được tái sử dụng và hoàn thiện từ bản cũ.

Điều kiện sử dụng đã được xử lý:

- Không tự xác nhận hoàn thành ngay khi mở bài.
- Chỉ mở các tham số được phép chỉnh sửa.
- Các bài dự đoán yêu cầu đáp án trước Play và khóa đáp án trong lần chạy đó.
- Bài Hooke ẩn k ở slider, Canvas và số liệu; tại F = 0, đồ thị không cung cấp dữ kiện suy k.
- Bài dự đoán tầm xa ẩn kết quả và đồ thị cho đến khi chạm đất.
- Reset hoặc Thử lại cho phép bắt đầu lại; không lưu tiến độ sau khi tải lại trang.

## 4. Những điểm kỹ thuật cần giữ khi tiếp nhận

### Công nghệ và tổ chức mã

React + TypeScript + Vite; CSS thuần, Canvas 2D và SVG. Không cài thêm dependency cho giai đoạn 1. Test tiếp tục dùng `node:test` theo setup sẵn có; Prettier giữ định dạng code nhất quán.

| Nơi cần đọc                                                          | Trách nhiệm                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/App.tsx`, `src/navigation.ts`                                   | Khung ứng dụng, trang chủ, điều hướng bằng hash              |
| `src/components/Home.tsx`                                            | Nội dung và các bàn thí nghiệm trên trang chủ                |
| `src/components/LabWorkspace.tsx`                                    | Trạng thái thí nghiệm, chuyển chế độ, luồng Challenge        |
| `src/simulations/catalog.ts`                                         | Danh sách mô hình, kiểu dữ liệu, mặc định và giới hạn slider |
| `src/simulations/spring/physics.ts`, `hooke.ts`                      | Tính toán dao động có pha và Hooke tĩnh                      |
| `src/simulations/torque/physics.ts`                                  | Tính moment, chênh lệch và xu hướng quay                     |
| `src/simulations/circular/physics.ts`                                | Trạng thái chuyển động tròn, vector và hình chiếu            |
| `src/simulations/projectile/physics.ts`                              | Logic ném ngang được giữ lại                                 |
| Các file `renderer.ts`, `hookeRenderer.ts`                           | Vẽ Canvas từ trạng thái tính toán                            |
| `src/simulations/clock.ts`, `useSimulation.ts`                       | Đồng hồ, RAF, Pause/Resume, ẩn tab và cleanup                |
| `SimulationCanvas.tsx`, `ControlPanel.tsx`, `SimulationControls.tsx` | Canvas tự resize và các điều khiển dùng chung                |
| `Graph.tsx`, `TheoryPanel.tsx`                                       | Đồ thị, công thức, giả thiết và bảng số liệu                 |
| `src/challenges/config.ts`, `ChallengePanel.tsx`                     | Cấu hình bài, điều kiện kiểm tra, validation và giao diện    |
| `tests/`                                                             | Test vật lý, đồng hồ, Challenge, điều hướng và vector Canvas |
| `vite.config.ts`, `index.html`                                       | Base path và tài nguyên cho bản static                       |

### Quy ước và hành vi quan trọng

- Giữ đơn vị SI trong physics; độ chỉ dùng ở UI và chuyển sang radian trước tính toán.
- Lò xo dao động: x dương sang phải; v lớn nhất tại vị trí cân bằng, a hướng về vị trí cân bằng.
- Hooke: giãn dương, nén âm; l₀ = 1 m, chỉ xét độ biến dạng trong ±0,30 m.
- Moment: ngược chiều kim đồng hồ là dương, ΣM = M₁ − M₂. Thanh không có mô phỏng động lực học quay.
- Tròn: quay ngược chiều kim đồng hồ, y hướng lên; hình chiếu bên phải dùng trục x có gốc dịch vị trí, cùng t và φ với vật quay.
- Ném ngang: y hướng xuống; thời gian bị chặn tại thời điểm chạm đất.
- Độ dài vector trên màn hình được scale để quan sát. Giá trị số theo SI mới là căn cứ so sánh giữa các bộ tham số.
- Giữ bản sửa vector vận tốc lò xo: dùng tỉ lệ cố định trong mỗi bộ tham số, tránh cắt ngưỡng 95 px làm mũi tên bão hòa gần VTCB.
- Một vòng RAF cập nhật Canvas và dấu chỉ SVG; bảng số liệu React tối đa 10 Hz. Đường cong SVG không được tính lại toàn bộ mỗi frame.
- Thay tham số động đưa về t = 0/Pause. Tab ẩn hoặc khoảng gián đoạn quá 250 ms không gây cộng dồn một bước nhảy lớn. Đổi thí nghiệm/unmount phải dọn frame và listener.

### Chỉnh sửa tiếp

Thông số mặc định nằm cạnh từng hàm physics; phạm vi slider ở `parameterSpecs` trong `catalog.ts`. Khi sửa, phải giữ mặc định và `initial` của Challenge trong giới hạn hợp lệ.

Thêm Challenge trong `challenges/config.ts`: khai báo ID, mô hình, nội dung, bộ tham số đầu, danh sách tham số được sửa, mục tiêu/dung sai, gợi ý và giải thích. Cập nhật `ChallengeId`, `validateChallenge`, `canCheckChallenge`, `predictionBeforeRun` hoặc đại lượng đối chiếu trong `LabWorkspace` nếu cần. Bổ sung test đúng/sai và kiểm tra UI; không tạo engine riêng cho bài mới.

## 5. Kết quả kiểm thử và nghiệm thu kỹ thuật

Các kết quả dưới đây được ghi nhận trong đợt triển khai giai đoạn 1 ngay trước khi lập handover. Việc viết tài liệu bàn giao không thay đổi logic ứng dụng và không được tính là một đợt chạy lại toàn bộ kiểm thử.

| Kiểm tra                        | Kết quả ghi nhận                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Test tự động                    | **48/48 đạt**, gồm 10 nhóm test                                                                                          |
| TypeScript                      | Đạt                                                                                                                      |
| Production build                | Đạt, xuất thư mục `dist/`                                                                                                |
| Prettier                        | Đạt                                                                                                                      |
| Tám Challenge trong trình duyệt | Hoàn thành được cả tám bài                                                                                               |
| Hooke bí mật                    | K bị ẩn, F = 0 bị chặn, đáp án đúng/sai và gợi ý/Thử lại hoạt động                                                       |
| Pha và đồ thị lò xo             | Pha 90° cho x = 0, v theo chiều âm; chuyển x/v/a đúng đơn vị                                                             |
| Moment                          | d₂ = 2 m cho chênh lệch bằng 0; hai xu hướng quay đúng; không có Play cho mô hình tĩnh                                   |
| Chuyển động tròn                | r = 2 m, ω = 3 rad/s cho aₕₜ = 18 m/s²; hình chiếu dừng ở T/4 với x = 0                                                  |
| Điều khiển động                 | Play/Pause/Resume/Reset, đổi tốc độ, reset khi đổi tham số đã được kiểm tra                                              |
| Chức năng cũ                    | Hai bài lò xo cũ và hai bài ném ngang tiếp tục hoạt động                                                                 |
| Responsive                      | Kiểm tra chiều rộng CSS 1200, 800, 390 px; không ghi nhận tràn ngang ở các panel chính                                   |
| Console                         | Không ghi nhận lỗi/cảnh báo trong các luồng đã thử                                                                       |
| Static dưới subpath             | Bản production chạy ở `/phylab/`, tải JS/CSS từ `/phylab/assets/`; điều hướng, Play/Pause và refresh deep link hoạt động |

Các ví dụ vật lý đã có test:

- Hooke: k = 100 N/m, F = 10 N → Δl = 0,1 m.
- Lò xo: m = 1 kg, k = 4π² N/m → T = 1 s; tăng m bốn lần thì T tăng hai lần.
- Moment: 20 × 1 = 10 × 2 = 20 N·m.
- Tròn: r = 2 m, ω = 3 rad/s, m = 1 kg → v = 6 m/s, aₕₜ = 18 m/s², Fₕₜ = 18 N.
- Hình chiếu tại góc 90° bằng 0 trong sai số số thực; trùng dao động cùng A, ω, φ tại nhiều thời điểm.
- Có test dữ liệu không hợp lệ, dấu lực/chiều quay, bảo toàn năng lượng, FPS, Pause/Resume, treo main thread và vector lò xo.

## 6. Hướng dẫn tiếp nhận và demo

### Chạy dự án

Yêu cầu Node.js 22.18+ hoặc 24+, pnpm.

```sh
pnpm install
pnpm dev
```

Mở URL Vite in ra, thường là `http://127.0.0.1:5173/`. Các máy chủ preview của phiên kiểm thử đã được dừng; cần chạy lệnh trên để mở lại.

```sh
pnpm test
pnpm build
pnpm format:check
pnpm preview
```

### Kịch bản demo khoảng 5–7 phút

1. Mở trang chủ, giới thiệu ba nhóm chính và hai chế độ học tập.
2. Hooke: đặt k = 100 N/m, F = 10 N, quan sát Δl = 0,100 m; thay F hoặc k và đối chiếu đồ thị. Sang bài độ cứng bí mật để minh họa suy luận từ phép đo.
3. Dao động lò xo: bật vector v/a, chạy rồi Pause; thay pha ban đầu và chọn đồ thị x/v/a. Minh họa bài chu kỳ 2 s với m = 1 kg, k = 10 N/m, cho T xấp xỉ 1,987 s.
4. Moment: mở Challenge, đặt d₂ = 2 m và kiểm tra hai moment cùng bằng 20 N·m.
5. Tròn: đặt r = 2 m, ω = 3 rad/s; quan sát aₕₜ = 18 m/s². Chạy bài dự đoán hình chiếu, chọn x = 0 và quan sát mốc T/4.
6. Nếu còn thời gian, mở ném ngang để xác nhận phần prototype cũ vẫn được giữ lại.

### Build và xuất bản

Chạy `pnpm build`, triển khai toàn bộ nội dung `dist/` lên hosting tĩnh. Vite dùng `base: './'`, tài nguyên tương đối và hash routes nên hỗ trợ cả root domain và subpath. Không cần backend hoặc server Node.js lúc sử dụng.

GitHub Pages/Cloudflare Pages đã có hướng dẫn trong README. Chưa có URL production công khai hoặc cấu hình CI/CD được bàn giao. Lần kiểm chứng `/phylab/` là preview local, không phải deployment công khai.

## 7. Giới hạn và việc cần làm tiếp

**Giới hạn hiện tại:** đây là ứng dụng mô phỏng theo mô hình vật lý lý tưởng, không phải phần mềm đo thực nghiệm. Tiến độ chỉ nằm trong bộ nhớ giao diện. Đáp án và tham số Challenge nằm ở frontend; việc ẩn k phục vụ trải nghiệm học tập, không phải bảo mật đề thi.

**Ngoài phạm vi, chưa triển khai:** backend/database, tài khoản, Teacher Mode, AI tutor, multiplayer, lưu tiến độ server, quản lý lớp, export PDF, 3D, ma sát/lực cản, va chạm, dao động cưỡng bức, cộng hưởng và hệ thống plugin.

**Chưa thực hiện:** publish hosting công khai, nghiệm thu sư phạm trong lớp học thực tế và kiểm thử trên mọi tổ hợp trình duyệt/thiết bị. Kết quả kiểm thử đã ghi nhận không thay thế các bước này.

**Các bước tiếp nhận đề xuất:**

1. Chạy các lệnh kiểm tra và thực hiện kịch bản demo trên máy trình chiếu thực tế.
2. Giáo viên rà soát thuật ngữ, quy ước trục, dung sai và nội dung gợi ý theo bài giảng.
3. Chọn nơi hosting, triển khai `dist/` và kiểm tra lại URL/subpath trên môi trường đó.
4. Ghi nhận phản hồi học sinh trước khi quyết định phạm vi giai đoạn tiếp theo.

Tài liệu sử dụng chi tiết: [README.md](README.md). Source và báo cáo bàn giao nằm cùng thư mục dự án.
