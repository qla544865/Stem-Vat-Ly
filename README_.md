# PhyLab — Phase 3

Phòng thí nghiệm vật lý tương tác dành cho học sinh THPT, giữ nhận diện **STEM vật lý 11C5**. React + TypeScript + Vite, Canvas 2D và SVG. Không backend, tài khoản, API hay physics engine bên ngoài.

Báo cáo kết quả triển khai và thông tin tiếp nhận: [HANDOVER.md](HANDOVER.md).

## Cài đặt và chạy

Yêu cầu Node.js **22.18+ hoặc 24+**, pnpm. Nếu dùng npm, thay `pnpm install/dev/build/test` bằng các lệnh npm tương ứng.

```sh
pnpm install
pnpm dev
```

Mở địa chỉ Vite in ra, thường là `http://127.0.0.1:5173/`.

```sh
pnpm test         # Các hàm vật lý, đồng hồ, rendering vector và điều kiện Challenge
pnpm exec tsc -b  # Kiểm tra TypeScript độc lập
pnpm build        # Kiểm tra TypeScript và tạo bản production trong dist/
pnpm preview      # Xem bản production
pnpm format       # Định dạng source bằng Prettier
pnpm format:check # Kiểm tra định dạng
```

## Khu vực học tập

Thanh điều hướng chia nội dung thành ba khu vực. Các liên kết mở trong cùng ứng dụng và giữ tương thích với các hash cũ, kể cả `#/spring` và `#/spring/hooke`.

- **Lý thuyết** (`#/theory`) có Hooke, moment lực, công của lực, tổng hợp và phân tích lực, công suất và hiệu suất. Mỗi minh họa cập nhật ngay khi đổi tham số.
- **Thí nghiệm** (`#/experiments`) có dao động lò xo, chuyển động tròn và hình chiếu, ném ngang, con lắc đơn, va chạm, bảo toàn cơ năng và dao động nâng cao. Mỗi mô hình mở ở Sandbox. Con lắc đơn còn có ba bài thực hành đo đạc.
- **Challenge Lab** (`#/challenges`) mở thử thách từ cả hai nhóm. Từng bài có đường dẫn `#/challenges/<id>` và dùng lại mô hình tương ứng.

| Nhóm                | Nội dung                                                          | Đồ thị                                          |
| ------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| Lò xo               | Hooke tĩnh: giãn/nén, ngoại lực và lực đàn hồi                    | F–Δl, điểm đo hiện tại                          |
| Lò xo               | Dao động điều hòa, pha ban đầu, vector v/a                        | Chọn x(t), v(t), a(t)                           |
| Moment lực          | Hai lực hướng xuống, cánh tay đòn, cân bằng và xu hướng quay      | So sánh M₁, M₂ theo N·m                         |
| Chuyển động tròn    | Quỹ đạo, vector tiếp tuyến/hướng tâm, hình chiếu dao động đồng bộ | x(t) của hình chiếu                             |
| Con lắc đơn         | Sandbox và ba khảo sát có phép đo 10 dao động                     | T–A, T–m, T–l, T²–l                             |
| Ném ngang (giữ lại) | Quỹ đạo parabol, thời gian rơi, tầm xa                            | y(t)                                            |
| Va chạm             | Hai xe trên ray một chiều, va chạm đàn hồi hoặc mềm               | Bảng vận tốc, động lượng và động năng trước/sau |
| Công của lực        | Minh họa tĩnh về lực, độ dời, góc và dấu của công                 | Công thức và giá trị A theo J                   |
| Bảo toàn cơ năng    | Vật thả từ nghỉ trên mặt phẳng nghiêng                            | Thanh động năng, thế năng và cơ năng theo J     |
| Dao động nâng cao   | Lò xo có lực cản nhớt và ngoại lực tuần hoàn                      | x(t), đường bao, E(t), X(Ω)                     |
| Tổng hợp lực        | Hai lực đồng quy và hợp lực                                       | Hình bình hành và hình chiếu Ox, Oy             |
| Công suất           | Hai máy cùng công A, khác thời gian                               | Thanh công, thời gian và số liệu W              |
| Hiệu suất           | Công đầu vào, công có ích và hao phí                              | Ba thanh trên cùng thang J                      |

- **Minh họa Lý thuyết** phản hồi khi đổi slider. Dùng nút Khôi phục thông số để về bộ mặc định.
- **Mô phỏng động** có Play/Pause/Resume/Reset, tốc độ 0.5×/1×/2× và chế độ Trình chiếu. Reset giữ tham số. Khôi phục thông số trả về bộ mặc định.
- Thay tham số của mô hình động đưa về t = 0 và Pause. Đổi nhóm/nội dung dọn vòng animation cũ và mở Sandbox mới.
- Vector vận tốc và gia tốc bật/tắt độc lập; chú thích có công tắc riêng. Vector được scale theo bộ thông số/khung vẽ để dễ nhìn; giá trị vật lý vẫn theo SI. Vector vận tốc lò xo không bị cắt ngưỡng gây bão hòa ở gần vị trí cân bằng.
- Góc và pha điều chỉnh bằng độ ở UI, chuyển sang radian trước khi tính toán. Công thức và bảng đọc luôn ghi rõ đơn vị.
- Trên desktop, panel ở bên phải. Khi chiều rộng ≤ 1000 px, panel chuyển xuống dưới; slider xếp hai cột trên tablet, một cột trên màn hình nhỏ.

## Sử dụng nội dung Phase 3

1. Mở `#/oscillator` và chọn **Tắt dần**. So sánh b = 1, 8 và 12 N·s/m với m = 1 kg và k = 16 N/m. Chỉ miền dưới tới hạn có hai đường bao trên đồ thị. Dùng đồ thị E(t) để quan sát cơ năng giảm khi b > 0.
2. Chọn **Cưỡng bức** và quan sát đường li độ thực cùng thành phần xác lập nét đứt khi b > 0. Chọn **Cộng hưởng** để so sánh vị trí Ω đang chọn, ω₀ và đỉnh li độ nếu có. Tần số góc đọc theo rad/s. Sandbox quan sát tối đa 30 giây vật lý mỗi lần chạy.
3. Mở `#/forces` và thay độ lớn, hướng hai lực bằng slider. Công tắc thành phần hiện hoặc ẩn đường chiếu trên hai trục. Hướng hợp lực được đo từ Ox theo chiều ngược kim đồng hồ.
4. Mở `#/power` để so sánh thời gian và công suất của hai máy thực hiện cùng công. Mở `#/efficiency` để chia công đầu vào thành phần có ích và hao phí. Khi giảm công đầu vào dưới công có ích, slider công có ích hạ về giới hạn mới.

## Con lắc đơn — Phase 2A

1. Từ trang chủ mở **Con lắc đơn**, hoặc thêm `#/pendulum` vào URL của PhyLab. Trong **Sandbox**, kéo và thả quả nặng hoặc chỉnh l, m, biên độ góc và g bằng slider. Đọc riêng chu kỳ góc nhỏ T₀ và chu kỳ phi tuyến T.
2. Sang **Thực hành**, chọn bài và viết dự đoán. Chọn một mốc, bấm **Đo 10 dao động**, chờ mô phỏng dừng rồi bấm **Ghi kết quả**. Lặp lại cho các mốc còn lại. Khi đã ghi đủ mốc, mở gợi ý kết luận của bài.
3. Sang **Kết quả & đồ thị** để đối chiếu bảng, nhận xét và đồ thị. Ghi ít nhất hai chiều dài để fit T²–l qua gốc và suy ra g. Hai đồ thị chiều dài có công tắc đường lý thuyết góc nhỏ.
4. Bật **Trình chiếu** để phóng to Canvas và số liệu. Dùng thanh chế độ để chuyển giữa mô phỏng và kết quả. Bấm **Thoát trình chiếu** để về bố cục học tập.

| Khảo sát   | Các mốc đo                                                                               | Giữ cố định                          |
| ---------- | ---------------------------------------------------------------------------------------- | ------------------------------------ |
| Biên độ    | A = 3, 6, 9, 18 cm theo độ lệch ngang tính từ đường thẳng đứng, với \|α₀\| = arcsin(A/l) | l = 50 cm, m = 50 g, g = 9,8 m/s²    |
| Khối lượng | m = 50, 100, 150 g                                                                       | l = 50 cm, \|α₀\| = 5°, g = 9,8 m/s² |
| Chiều dài  | l = 40, 50, 60 cm                                                                        | m = 50 g, \|α₀\| = 5°, g = 9,8 m/s²  |

Phép đo dùng thời gian vật lý. Tốc độ 2× rút ngắn thời gian chờ trên màn hình và giữ nguyên t₁₀. Đặt lại mô phỏng hoặc đổi bộ tham số đưa đồng hồ về 0. Các hàng đã ghi được giữ khi chuyển giữa ba chế độ hoặc sang bàn thí nghiệm khác trong cùng phiên. Tải lại trang sẽ xóa dữ liệu phiên. Nút xóa dữ liệu hỏi xác nhận khi có nhiều hàng.

## Các giả thiết và quy ước vật lý

- **Hooke:** lò xo nằm ngang lý tưởng, cân bằng tĩnh, chiều dài tự nhiên l₀ = 1 m. F = kΔl, F đàn hồi = −kΔl. Giãn mang dấu dương, nén âm; chỉ xét |Δl| ≤ 0,30 m. Slider k = 40–200 N/m, F = −12 đến +12 N bảo đảm luôn nằm trong mô hình đàn hồi.
- **Dao động lò xo:** bỏ qua ma sát, lực cản và khối lượng lò xo. Gốc tại vị trí cân bằng, x dương sang phải. x = A cos(ωt + φ), v = −Aω sin(ωt + φ), a = −ω²x, ω = √(k/m). Chu kỳ và năng lượng không phụ thuộc pha.
- **Moment:** thanh lý tưởng, bỏ qua trọng lượng, trục O cố định có phản lực. Hai lực hướng xuống, ở hai phía O, cánh tay đòn 0–3 m. M₁ = F₁d₁ ngược chiều kim đồng hồ, M₂ = F₂d₂ theo chiều kim đồng hồ. ΣM = M₁ − M₂; ngưỡng số học học tập 0,10 N·m. Không tích phân chuyển động quay.
- **Tròn:** ω > 0, quay ngược chiều kim đồng hồ; x sang phải, y hướng lên. θ = ωt + φ; v = ωr; aₕₜ = ω²r; Fₕₜ = mω²r. Khung hình chiếu bên phải có gốc được dịch sang phải, cùng chiều dương x, cùng t và φ. A = r.
- **Ném ngang:** bỏ qua sức cản; g hằng số. Gốc tại vị trí ném, y hướng xuống. Thời gian dừng chính xác tại √(2h/g); vật không xuyên qua đất. Canvas tự scale theo chiều cao, tầm xa và mục tiêu.
- **Con lắc đơn:** chất điểm, dây nhẹ không dãn, chuyển động phẳng trong trọng trường đều, bỏ qua lực cản. Solver RK4 bước 1/240 s giải θ″ + (g/l) sin θ = 0. Mỗi chu kỳ kết thúc khi vật trở lại biên phía thả. Đồng hồ nội suy lần thứ 10 và tính T đo = t₁₀/10. T₀ = 2π√(l/g) là gần đúng góc nhỏ.
- **Va chạm** xét hai xe dài 1,2 m trên ray ngang dài 20 m. Chiều dương sang phải và bỏ qua ngoại lực theo ray. Với v₁ > v₂, hai mép tiếp xúc sau thời gian `(x₂ − x₁ − 1,2)/(v₁ − v₂)`. Va chạm đàn hồi đảo dấu vận tốc tương đối trong hệ khối tâm. Va chạm mềm cho cả hai xe vận tốc chung `P/(m₁+m₂)`. Dừng quan sát ở 10 s hoặc khi một xe tới biên ray.
- **Công của lực** tính `A = Fs cos α` cho một lực không đổi và độ dời cho trước. Hệ số cos ở 90° được xử lý về 0. F = 0 hoặc s = 0 cũng cho A = 0.
- **Bảo toàn cơ năng** dùng dốc cố định không ma sát và chọn chân dốc làm mốc thế năng. Giải theo thời gian với `a = g sin β`, `s = at²/2` và `L = h/sin β`. Đồng hồ dừng ở `t = √(2L/a)`, khi vật tới chân dốc với tốc độ `√(2gh)`. Thanh năng lượng so sánh `½mv²`, `mgy` và tổng của chúng.
- **Dao động nâng cao** giải `mx″ + bx′ + kx = F₀ cos(Ωt)` với x dương sang phải, x(0) = x₀ và v(0) = 0. Lò xo tuyến tính và lực cản nhớt lý tưởng. Tắt dần đặt F₀ = 0. Khi b > 0, biên độ xác lập là `X = F₀/√((k − mΩ²)² + (bΩ)²)`. Đỉnh li độ dương chỉ có khi `k/m − b²/(2m²) > 0`. Quét cộng hưởng dùng b ≥ 0,1 N·s/m. Trường hợp không cản đúng ω₀ được quan sát trong chế độ Cưỡng bức. [MIT OCW, Forced Oscillation and Resonance](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/b6ac40e47d6a8b8c2642f174622785b1_MIT8_03SCF16_Text_Ch2.pdf)
- **Tổng hợp lực** dùng `Rx = F₁x + F₂x`, `Ry = F₁y + F₂y`, `R = hypot(Rx, Ry)` và `atan2(Ry, Rx)`. Hợp lực bằng 0 có hướng không xác định. Tất cả vector dùng cùng tỉ lệ trong Canvas.
- **Công suất** dùng `P = A/t` với t > 0. So sánh công suất trung bình qua hai thời gian hoàn thành, với công chung cho trước.
- **Hiệu suất** dùng `H = 100 × Aích/Ađầu vào` với đầu vào dương. Công hao phí bằng hiệu giữa công đầu vào và công có ích. Ba thanh dùng chung miền 0–1000 J.

Mọi hàm physics kiểm tra tính hữu hạn và các điều kiện dấu phù hợp. Ứng dụng không cần Internet để tính hoặc chạy thí nghiệm sau khi tải frontend; Google Fonts là tài nguyên trình bày tùy chọn, có font hệ thống dự phòng.

## Challenge Lab

Có **21 thử thách**, dùng chung mô hình vật lý với khu vực Lý thuyết và Thí nghiệm. Bài **Đạt mục tiêu** chấm thông số qua kết quả vật lý. Bài **Dự đoán** khóa đáp án khi bắt đầu mô phỏng hoặc khi nộp các tình huống phân loại. Bài **Điều tra** dùng phép đo để suy ra đại lượng bị ẩn.

| Thử thách                      | Thao tác                                            | Điều kiện hoàn thành                                 |
| ------------------------------ | --------------------------------------------------- | ---------------------------------------------------- |
| Độ cứng bí mật                 | Chỉnh F khác 0, quan sát Δl, nhập k                 | Đúng trong ±5%; không kiểm tra được từ phép đo F = 0 |
| Đạt chu kỳ mục tiêu            | Chỉnh m, k rồi chạy                                 | T = 2 s ± 0,05 s                                     |
| Khối lượng & chu kỳ (giữ lại)  | Dự đoán, tăng m từ 0,5 lên 2 kg, chạy               | Chọn tăng 2 lần và đo đúng tỉ số T₂/T₁               |
| Cân bằng thanh                 | Chỉnh d₂ với F₁ = 20 N, d₁ = 1 m, F₂ = 10 N         | Độ lớn chênh lệch moment ≤ 0,10 N·m; nghiệm d₂ = 2 m |
| Gia tốc hướng tâm              | Chỉnh r, ω rồi chạy                                 | aₕₜ = 18 m/s² ± 0,20 m/s²                            |
| Dự đoán hình chiếu             | Chọn đáp án trước khi chạy từ φ = 0                 | Tự dừng ở T/4; chọn x = 0                            |
| Bắn trúng mục tiêu (giữ lại)   | Chỉnh v₀, chạy đến khi chạm đất                     | Tầm xa cách 18 m không quá 0,50 m                    |
| Dự đoán tầm xa (giữ lại)       | Nhập đáp án trước khi chạy                          | Sai lệch ≤ 0,50 m; kiểm tra sau khi chạm đất         |
| Dự đoán vận tốc sau va chạm    | Nhập vận tốc có dấu của xe A rồi chạy               | Sai lệch ≤ 0,05 m/s, kiểm tra sau tiếp xúc           |
| Hai xe cùng đứng yên           | Chỉnh vận tốc hai xe trong va chạm mềm              | Vận tốc chung có độ lớn ≤ 0,05 m/s sau tiếp xúc      |
| Đại lượng nào được bảo toàn?   | Chọn đại lượng và chạy va chạm mềm                  | Chọn tổng động lượng và quan sát tiếp xúc            |
| Tạo công 100 J                 | Chỉnh F, s và α                                     | Công dương 100 J ± 0,5 J                             |
| Phân loại công của lực         | Chọn dấu công ở 30°, 90° và 150°                    | Cả ba dấu đúng                                       |
| Tìm độ cao để đạt 10 m/s       | Chỉnh h và chạy tới chân dốc                        | Tốc độ 10 m/s ± 0,05 m/s                             |
| Dự đoán sự chuyển hóa cơ năng  | Chọn dự đoán và chạy tới chân dốc                   | Động năng tăng, thế năng giảm, cơ năng giữ nguyên    |
| Điều chỉnh tắt dần             | Chỉnh b và chạy tới 5 s                             | Đường bao dưới 0,05 m trong miền dưới tới hạn        |
| Tìm tần số kích thích          | Đo X với các giá trị Ω                              | Sai lệch với đỉnh li độ tối đa 0,05 rad/s            |
| Phân biệt hiện tượng           | Phân loại ba tình huống bằng thông số lực và tần số | Cả ba đúng                                           |
| Tạo hợp lực theo hướng yêu cầu | Chỉnh độ lớn và hướng lực 2                         | 20 N ± 0,5 N, 37° ± 2°                               |
| Tìm thời gian nâng             | Chỉnh thời gian máy A thực hiện 300 J               | Công suất 40 W ± 0,25 W                              |
| Đạt hiệu suất mục tiêu         | Chỉnh công có ích của máy nhận 400 J                | 75% ± 0,5 điểm phần trăm                             |

Các bài mới có ba cấp gợi ý mở tuần tự. Chọn **Kiểm tra kết quả** khi đủ điều kiện để xem mục tiêu, số đo và giải thích. Chọn **Thử lại** để xóa câu trả lời, thông số đã chỉnh và gợi ý đã mở. Reset mô phỏng giữ thông số và mở một lượt dự đoán mới. Bài độ cứng bí mật ẩn k ở slider, Canvas và số liệu. Bài tìm tần số kích thích hiện đường quét sau khi kiểm tra.

## Cấu trúc source

```text
src/
  App.tsx                       # Header, trang chủ và hash navigation
  navigation.ts                 # Các đường dẫn; không cần router/dependency mới
  components/
    Home.tsx                    # Các bàn thí nghiệm chính và lối vào ném ngang
    LabWorkspace.tsx            # Trạng thái một thí nghiệm và luồng Challenge
    PendulumLab.tsx             # Sandbox, phiếu thực hành và dữ liệu theo phiên
    PendulumResults.tsx         # Bảng, đồ thị đo đạc và kết luận con lắc
    SimulationCanvas.tsx        # Resize/DPR, gọi renderer, không tự tạo RAF
    SimulationControls.tsx      # Play/Pause/Reset/tốc độ
    ControlPanel.tsx             # Slider và công tắc hiển thị dùng chung
    Graph.tsx                   # SVG: đồ thị theo thời gian/Hooke/moment
    OscillatorGraphs.tsx        # Li độ, cơ năng và đường quét cộng hưởng
    TheoryPanel.tsx             # Công thức, giả thiết, số liệu SI
    ChallengePanel.tsx
  simulations/
    catalog.ts                  # Danh sách, mặc định, phạm vi slider
    clock.ts                    # Đồng hồ elapsed time
    useSimulation.ts            # Một RAF, pause/visibility/cleanup và subscribe
    drawing.ts                  # Tiện ích vẽ Canvas nhỏ
    spring/{physics,renderer}.ts
    spring/{hooke,hookeRenderer}.ts
    torque/{physics,renderer}.ts
    circular/{physics,renderer}.ts
    projectile/{physics,renderer}.ts
    pendulum/                    # RK4, đo, cấu hình bài, vẽ và tương tác Canvas
    oscillator/                 # Nghiệm giải tích và Canvas lò xo có cản/kích thích
    interactive/                # Hợp lực, công suất và hiệu suất
  challenges/config.ts          # Nội dung, cấu hình, validation và điều kiện thử nghiệm
  challenges/phase3.ts          # Sáu bài Phase 3 và hàm lấy số đo
  styles.css
tests/
  physics.test.ts               # Test cũ, được giữ lại và cập nhật clock
  phase1.test.ts                # Hooke, moment, pha, tròn, Challenge, giới hạn và routes
  spring-renderer.test.ts       # Độ dài/hướng vector Canvas theo pha dao động
  pendulum.test.ts              # Chu kỳ, năng lượng, phép đo và fit T²–l
  oscillator.test.ts            # Nghiệm giải tích, biên slider và pha kích thích
  phase3.test.ts                # Vật lý tương tác và validator Phase 3
```

Một RAF duy nhất cập nhật Canvas và dấu chỉ SVG theo từng frame; bảng số liệu React cập nhật tối đa 10 Hz. Đường cong SVG chỉ được dựng lại khi đổi thông số, đại lượng hoặc cửa sổ thời gian. Tab ẩn hủy frame đang đợi, quay lại lấy mốc mới. Khoảng gián đoạn quá 250 ms do main thread bị treo không được cộng dồn vào thời gian vật lý. Cleanup khi pause, đổi thí nghiệm hoặc unmount.

## Chỉnh mặc định, slider hoặc Challenge

- Mỗi bộ mặc định nằm cạnh hàm physics của mô hình.
- Giới hạn/đơn vị/bước slider nằm ở `parameterSpecs` trong `src/simulations/catalog.ts`. Giữ mặc định và `initial` của Challenge trong giới hạn. `phi` tại physics/Challenge luôn là radian.
- Thêm ID duy nhất vào `ChallengeId`. Khai báo mô hình, `initial`, `editable`, `type`, mục tiêu và dung sai, `hint`, `extraHints` nếu có và `explanation`. Xem các ví dụ trong `src/challenges/phase3.ts`.
- Dùng `measure` để lấy số đo từ trạng thái mô hình. Dùng `checkWhen` hoặc `observeUntil` để đặt điều kiện kiểm tra, `answer` cho một trường nhập hoặc `classification` cho nhiều tình huống. Bổ sung validator khi quy tắc vật lý mới cần một cách chấm khác.
- Thêm test đúng/sai, test điều kiện thực nghiệm và một lần thử trong UI cho bài mới.

## Build và deploy frontend tĩnh

```sh
pnpm build
```

Đưa **toàn bộ nội dung `dist/`** lên hosting tĩnh, giữ nguyên `assets/` và `favicon.svg`. Không cần server Node.js lúc chạy sản phẩm.

`vite.config.ts` dùng `base: './'`, favicon và tài nguyên build có đường dẫn tương đối. Điều hướng bằng hash, ví dụ `#/oscillator` hoặc `#/challenges/damping-envelope`. Hosting tĩnh có thể phục vụ trực tiếp `index.html` tại thư mục gốc hoặc subpath.

- **GitHub Pages:** build trên CI/máy local rồi triển khai `dist/` làm Pages artifact (hoặc nội dung nhánh xuất bản). Có thể đặt dưới subpath của repository, ví dụ `/PhySim/`, mà không đổi source.
- **Cloudflare Pages:** build command `pnpm build`, output directory `dist`, dùng Node 22.18+/24+. Không cần Functions hoặc backend.
- Luôn mở URL thư mục có dấu `/` cuối, ví dụ `https://example.org/PhySim/`. Khi dùng build tự động, cài dependency từ lockfile trước build.

Có thể kiểm tra production dưới subpath tại local:

```sh
pnpm build
pnpm preview --base /phylab/
```

Mở địa chỉ `/phylab/` trên cổng Vite preview in ra. Không publish hosting công khai tự động trong giai đoạn này.

## Kết quả kiểm chứng Phase 1

- 48 bài test tự động đạt: các ví dụ vật lý trong đặc tả, pha/biên/VTCB, bảo toàn năng lượng, hướng vector tròn, hình chiếu đồng bộ, slider, đồng hồ và validation đúng/sai của các Challenge.
- TypeScript và production build đã qua.
- Kiểm thử trực tiếp cả 8 Challenge; đáp án Hooke đúng/sai, ẩn k/chặn F = 0, gợi ý/Thử lại, đồ thị x/v/a, Pause/Resume/Reset, đổi pha/đổi tốc độ, giữ chức năng ném ngang. Console không ghi nhận lỗi/cảnh báo.
- Kiểm tra bố cục ở chiều rộng CSS 1200, 800 và 390 px: không tràn ngang ở các panel chính; tablet chuyển panel xuống dưới Canvas.
- Đã mở bản production tại `/phylab/`: JavaScript và CSS tải từ `/phylab/assets/`, chuyển sang trang chuyển động tròn và Play/Pause hoạt động, console không có lỗi/cảnh báo.

Các chức năng ngoài phạm vi Phase 1 gồm backend, tài khoản, Teacher Mode, AI tutor, lưu tiến độ, đo thực nghiệm, 3D, ma sát/lực cản, va chạm, cộng hưởng và hệ thống plugin. Phase 2A bổ sung đo chu kỳ trên mô phỏng con lắc đơn.
