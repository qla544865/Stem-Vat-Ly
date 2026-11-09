# PhyLab — giai đoạn 2A

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
pnpm build        # Kiểm tra TypeScript và tạo bản production trong dist/
pnpm preview      # Xem bản production
pnpm format       # Định dạng source bằng Prettier
pnpm format:check # Kiểm tra định dạng
```

## Các thí nghiệm

Trang chủ có bốn nhóm chính và một lối vào thí nghiệm ném ngang cũ. Mỗi thí nghiệm mở ở Sandbox, không reload trang khi đổi nội dung/chế độ.

| Nhóm                | Nội dung                                                          | Đồ thị                  |
| ------------------- | ----------------------------------------------------------------- | ----------------------- |
| Lò xo               | Hooke tĩnh: giãn/nén, ngoại lực và lực đàn hồi                    | F–Δl, điểm đo hiện tại  |
| Lò xo               | Dao động điều hòa, pha ban đầu, vector v/a                        | Chọn x(t), v(t), a(t)   |
| Moment lực          | Hai lực hướng xuống, cánh tay đòn, cân bằng và xu hướng quay      | So sánh M₁, M₂ theo N·m |
| Chuyển động tròn    | Quỹ đạo, vector tiếp tuyến/hướng tâm, hình chiếu dao động đồng bộ | x(t) của hình chiếu     |
| Con lắc đơn         | Sandbox và ba khảo sát có phép đo 10 dao động                     | T–A, T–m, T–l, T²–l     |
| Ném ngang (giữ lại) | Quỹ đạo parabol, thời gian rơi, tầm xa                            | y(t)                    |

- **Hooke và moment là mô hình tĩnh:** kéo slider để nhận phản hồi ngay; không có nút Play hoặc thanh quay giả lập.
- **Lò xo dao động, tròn, ném ngang:** Play/Pause/Resume/Reset, tốc độ 0.5×/1×/2×. Reset giữ tham số; Khôi phục thông số trả về bộ mặc định.
- Thay tham số của mô hình động đưa về t = 0 và Pause. Đổi nhóm/nội dung dọn vòng animation cũ và mở Sandbox mới.
- Vector vận tốc và gia tốc bật/tắt độc lập; chú thích có công tắc riêng. Vector được scale theo bộ thông số/khung vẽ để dễ nhìn; giá trị vật lý vẫn theo SI. Vector vận tốc lò xo không bị cắt ngưỡng gây bão hòa ở gần vị trí cân bằng.
- Góc và pha điều chỉnh bằng độ ở UI, chuyển sang radian trước khi tính toán. Công thức và bảng đọc luôn ghi rõ đơn vị.
- Trên desktop, panel ở bên phải. Khi chiều rộng ≤ 1000 px, panel chuyển xuống dưới; slider xếp hai cột trên tablet, một cột trên màn hình nhỏ.

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

Mọi hàm physics kiểm tra tính hữu hạn và các điều kiện dấu phù hợp. Ứng dụng không cần Internet để tính hoặc chạy thí nghiệm sau khi tải frontend; Google Fonts là tài nguyên trình bày tùy chọn, có font hệ thống dự phòng.

## Challenge Lab

Có **8 thử thách**, dùng cùng physics/rendering với Sandbox:

| Thử thách                     | Thao tác                                    | Điều kiện hoàn thành                                 |
| ----------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Độ cứng bí mật                | Chỉnh F khác 0, quan sát Δl, nhập k         | Đúng trong ±5%; không kiểm tra được từ phép đo F = 0 |
| Đạt chu kỳ mục tiêu           | Chỉnh m, k rồi chạy                         | T = 2 s ± 0,05 s                                     |
| Khối lượng & chu kỳ (giữ lại) | Dự đoán, tăng m từ 0,5 lên 2 kg, chạy       | Chọn tăng 2 lần và đo đúng tỉ số T₂/T₁               |
| Cân bằng thanh                | Chỉnh d₂ với F₁ = 20 N, d₁ = 1 m, F₂ = 10 N | Độ lớn chênh lệch moment ≤ 0,10 N·m; nghiệm d₂ = 2 m |
| Gia tốc hướng tâm             | Chỉnh r, ω rồi chạy                         | aₕₜ = 18 m/s² ± 0,20 m/s²                            |
| Dự đoán hình chiếu            | Chọn đáp án trước khi chạy từ φ = 0         | Tự dừng ở T/4; chọn x = 0                            |
| Bắn trúng mục tiêu (giữ lại)  | Chỉnh v₀, chạy đến khi chạm đất             | Tầm xa cách 18 m không quá 0,50 m                    |
| Dự đoán tầm xa (giữ lại)      | Nhập đáp án trước khi chạy                  | Sai lệch ≤ 0,50 m; kiểm tra sau khi chạm đất         |

Mỗi bài có gợi ý, giải thích, thông báo đúng/sai và Thử lại. Bài dự đoán khóa câu trả lời sau khi chạy, Reset/Thử lại cho phép dự đoán lại. Đáp án không được tự xác nhận ngay lúc mở bài. Độ cứng bí mật bị ẩn ở slider, Canvas và số liệu; đồ thị không cho dữ kiện suy k ở F = 0. Bài dự đoán tầm xa ẩn kết quả và đồ thị cho đến khi chạm đất.

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
  challenges/config.ts          # Nội dung, cấu hình, validation và điều kiện thử nghiệm
  styles.css
tests/
  physics.test.ts               # Test cũ, được giữ lại và cập nhật clock
  phase1.test.ts                # Hooke, moment, pha, tròn, Challenge, giới hạn và routes
  spring-renderer.test.ts       # Độ dài/hướng vector Canvas theo pha dao động
  pendulum.test.ts              # Chu kỳ, năng lượng, phép đo và fit T²–l
```

Một RAF duy nhất cập nhật Canvas và dấu chỉ SVG theo từng frame; bảng số liệu React cập nhật tối đa 10 Hz. Đường cong SVG chỉ được dựng lại khi đổi thông số, đại lượng hoặc cửa sổ thời gian. Tab ẩn hủy frame đang đợi, quay lại lấy mốc mới. Khoảng gián đoạn quá 250 ms do main thread bị treo không được cộng dồn vào thời gian vật lý. Cleanup khi pause, đổi thí nghiệm hoặc unmount.

## Chỉnh mặc định, slider hoặc Challenge

- Mặc định nằm trong `springDefaults`, `hookeDefaults`, `torqueDefaults`, `circularDefaults`, `projectileDefaults` cạnh các hàm physics.
- Giới hạn/đơn vị/bước slider nằm ở `parameterSpecs` trong `src/simulations/catalog.ts`. Giữ mặc định và `initial` của Challenge trong giới hạn. `phi` tại physics/Challenge luôn là radian.
- Thêm một bài cùng mô hình vào `challenges` trong `src/challenges/config.ts`: ID duy nhất, `experiment`, `model` nếu là Hooke, tiêu đề/mô tả, `initial`, `editable`, mục tiêu/dung sai, gợi ý và giải thích. `answer` định nghĩa trường số hoặc các lựa chọn.
- Thêm ID vào `ChallengeId`; bổ sung nhánh kiểm tra trong `validateChallenge`/`canCheckChallenge`, và đại lượng đối chiếu trong `LabWorkspace` nếu bài dùng đại lượng mới. Với kiểu dự đoán cần khóa trước Play, cập nhật `predictionBeforeRun`. Không tạo mô phỏng hoặc engine riêng cho từng bài.
- Thêm test đúng/sai, test điều kiện thực nghiệm và một lần thử trong UI cho bài mới.

## Build và deploy frontend tĩnh

```sh
pnpm build
```

Đưa **toàn bộ nội dung `dist/`** lên hosting tĩnh, giữ nguyên `assets/` và `favicon.svg`. Không cần server Node.js lúc chạy sản phẩm.

`vite.config.ts` dùng `base: './'`, favicon và tài nguyên build có đường dẫn tương đối. Điều hướng bằng hash (`#/spring/hooke`, `#/spring/oscillation`, `#/torque`, `#/circular`, `#/pendulum`, `#/projectile`), nên không cần cấu hình rewrite SPA trên server.

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
