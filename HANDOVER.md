# PHYLAB — BÀN GIAO PHASE 3

**Ngày lập** 10/11/2026

## Phạm vi đã triển khai

- **3A** thêm bàn `#/oscillator` với ba chế độ Tắt dần, Cưỡng bức, Cộng hưởng. Canvas vẽ hệ lò xo ngang, vị trí cân bằng, li độ và ba lực có dấu. Đồ thị dùng chung thời gian với Canvas và bảng số liệu.
- **3B** thêm ba minh họa trong Lý thuyết tại `#/forces`, `#/power` và `#/efficiency`. Các minh họa cập nhật từ slider ngay khi đổi tham số.
- **3C** bổ sung sáu bài, nâng tổng số lên 21 và giữ 15 ID cùng các hash cũ. Challenge Lab phân loại Đạt mục tiêu, Dự đoán và Điều tra. Bài mới có ba cấp gợi ý, bài cũ tiếp tục hỗ trợ một cấp. Kết quả chấm giữ số đo tại lúc kiểm tra, kèm mục tiêu, công thức và giải thích. Thử lại tạo một lượt mới.
- **3D** rà công thức, biên slider, renderer, đồ thị, điều hướng, luồng trạng thái và thời gian. Canvas dùng kích thước do `ResizeObserver` cập nhật. Đồ thị tĩnh và đồ thị đang ẩn bỏ đăng ký theo frame. Các bài dự đoán khóa đáp án trước khi chạy và mở số đo tương ứng tại mốc kiểm chứng.

## Tệp triển khai

| Tệp mới                                                                    | Trách nhiệm                                                 |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `src/simulations/oscillator/physics.ts`, `renderer.ts` trong cùng thư mục  | Nghiệm giải tích, đường bao, đáp ứng tần số và Canvas lò xo |
| `src/components/OscillatorGraphs.tsx`                                      | Đồ thị li độ, cơ năng và đáp ứng xác lập                    |
| `src/simulations/interactive/physics.ts`, `renderer.ts` trong cùng thư mục | Hợp lực, công suất trung bình, hiệu suất và minh họa Canvas |
| `src/challenges/phase3.ts`                                                 | Dữ liệu sáu bài, cách lấy số đo và điều kiện chấm           |
| `tests/oscillator.test.ts`, `tests/phase3.test.ts`                         | Vật lý, biên số, đồng hồ, điều kiện đúng/sai và deep link   |

| Tệp cập nhật                                                                                | Trách nhiệm                                            |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/simulations/catalog.ts`, `src/navigation.ts`                                           | Mô hình, slider, phân loại và hash                     |
| `src/challenges/config.ts`, `src/components/ChallengePanel.tsx`                             | Kiểu bài, gợi ý, khóa đáp án, validator và kết quả     |
| `src/components/LabWorkspace.tsx`, `ControlPanel.tsx`, `TheoryPanel.tsx` trong cùng thư mục | Nối trạng thái với giao diện, điều khiển và bảng đọc   |
| `src/components/Graph.tsx`, `SimulationCanvas.tsx` trong cùng thư mục, `src/styles.css`     | Ẩn kết quả dự đoán, vòng đời Canvas và bố cục          |
| `tests/phase2b-c-d.test.ts`                                                                 | Kiểm tra tường minh đủ 15 ID cũ và các mục catalog mới |
| `README.md`, `README_.md`, `HANDOVER.md`                                                    | Cách dùng, cấu hình, chạy kiểm thử và bàn giao         |

## Mô hình và các điểm audit

| Mô hình           | Công thức, giả thiết và trường hợp biên đã rà                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hooke             | `Δl = F/k`, giãn dương, đàn hồi ngược ngoại lực. Slider giữ `\|Δl\| ≤ 0,30 m`. Phép đo F = 0 của bài điều tra giữ k ẩn và bị chặn khi chấm.                                       |
| Lò xo lý tưởng    | `x = A cos(ωt + φ)`, `v = −Aω sin(ωt + φ)`, `a = −ω²x`. Chiều dương sang phải, năng lượng và chu kỳ độc lập với pha. Bài khối lượng chờ đúng một chu kỳ để hiện kết quả.          |
| Moment lực        | `ΣM = F₁d₁ − F₂d₂` với hai lực hướng xuống hai phía O. Cánh tay đòn 0 cho moment 0. Quy ước ngược kim đồng hồ dương và dung sai học tập 0,10 N·m.                                 |
| Chuyển động tròn  | `v = ωr`, `aₕₜ = ω²r`, `x = r cos(ωt + φ)`. Hai khung dùng cùng t và pha. Bài hình chiếu hiện đồ thị tại T/4 sau khi khóa đáp án.                                                 |
| Ném ngang         | `x = v₀t`, `y = gt²/2`, trục y hướng xuống. Canvas và số liệu dừng ở `√(2h/g)`. Bài dự đoán ẩn tầm xa tới khi chạm đất.                                                           |
| Con lắc đơn       | `θ″ = −(g/l) sin θ`, thả từ nghỉ, bỏ qua cản. RK4 bước 1/240 s và nội suy lúc trở về biên thả. Chu kỳ góc nhỏ dùng làm tham chiếu.                                                |
| Va chạm           | Xe chạm theo hai mép, rồi dùng hệ khối tâm cho đàn hồi hoặc vận tốc chung cho va chạm mềm. Vận tốc và động lượng có dấu theo ray. Bảng Sau chỉ mở khi có tiếp xúc.                |
| Công của lực      | `A = Fs cos α`, lực và độ dời không đổi. Kiểm tra dấu ở góc nhọn, vuông, tù và biên F hoặc s bằng 0.                                                                              |
| Bảo toàn cơ năng  | `a = g sin β`, `E = ½mv² + mgy`. Dốc không ma sát, mốc thế năng ở chân dốc. Đồng hồ, Canvas và thanh năng lượng cùng dừng tại chân dốc.                                           |
| Dao động nâng cao | `mx″ + bx′ + kx = F₀ cos(Ωt)`, `v(0) = 0`, `x(0) = x₀`. Cản nhớt `−bv`, lực đàn hồi `−kx`. Dưới tới hạn có đường bao `±A₀e⁻ᵇᵗ⁄²ᵐ`. Cơ năng của hệ tự do giảm theo `dE/dt = −bv²`. |
| Tổng hợp lực      | Cộng các thành phần có dấu trên Ox/Oy, lấy hướng bằng `atan2`. Khi `R ≈ 0`, hướng không xác định. Các vector Canvas dùng chung tỉ lệ.                                             |
| Công suất         | `P = A/t`, t > 0. Hai máy nhận cùng A, thanh thời gian dùng chung thang s và thanh công dùng chung thang J.                                                                       |
| Hiệu suất         | `H = 100 × Aích/Ađầu vào`. Ràng buộc `0 ≤ Aích ≤ Ađầu vào` với đầu vào dương. Ba thanh dùng cùng thang J, với hao phí bằng đầu vào trừ phần có ích.                               |

Solver dao động nâng cao đánh giá trực tiếp tại thời gian mô phỏng. Nghiệm thuần nhất phân theo dấu của `k/m − (b/2m)²`. Nghiệm cưỡng bức cộng đáp ứng riêng và nghiệm thuần nhất đã khớp điều kiện đầu. Gần điểm kỳ dị không cản, solver dùng tích phân chính xác của đáp ứng xung với các biểu thức ổn định số. Tại b = 0 và Ω = ω₀, hệ có thành phần biên độ tăng theo thời gian. [MIT OCW, Forced Oscillation and Resonance](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/b6ac40e47d6a8b8c2642f174622785b1_MIT8_03SCF16_Text_Ch2.pdf)

Quét tần số dùng b ≥ 0,1 N·s/m. Biên độ xác lập `X = F₀/√((k − mΩ²)² + (bΩ)²)` tính bằng m. Vị trí đỉnh `Ωđỉnh = √(k/m − b²/(2m²))` tính bằng rad/s và chỉ hiện khi căn thức dương. Mô phỏng dùng `useSimulation` hiện có, với một RAF khi chạy. Thay tham số đưa về t = 0. Đồ thị lưu đường theo tham số và cửa sổ thời gian, còn điểm đánh dấu theo frame.

Hash chỉ khớp các route hoặc ID đã đăng ký. Slider giới hạn đầu vào hữu hạn và chuyển độ sang radian trước khi tính. Audit không thấy đường thực thi biểu thức hay chèn HTML từ đầu vào. Thông số và đáp án Challenge nằm trong bundle tĩnh, nên việc ẩn đáp án phục vụ quy trình học trong giao diện.

## Kết quả kiểm chứng Phase 3

| Kiểm tra                           | Kết quả thực tế                                                                                                                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Baseline trên working tree ban đầu | 78/78 test, `pnpm exec tsc -b`, `pnpm format:check` và `pnpm build` đạt. Hai chỉnh sửa có sẵn trong `.gitignore` và nhãn Lý thuyết được giữ lại.                                                                                                                                     |
| Regression sau triển khai          | 95/95 test đạt, gồm 17 test mới. TypeScript, Prettier và production build đạt. Hai kiểm tra catalog cũ được mở rộng để xác nhận danh sách mô hình mới và đủ từng ID cũ.                                                                                                              |
| Challenge trên Chromium 156        | Chấm thành công cả 15 bài cũ. Cả sáu bài mới đã chạy đúng/sai, mở ba cấp gợi ý, thử lại và refresh deep link. Kiểm tra ẩn kết quả trước mốc và khóa dự đoán khi chạy.                                                                                                                |
| Màn hình và điều khiển             | Chromium headless ở 1920×1080, 1366×768, 800×900 và 390×844. Đã kiểm tra chuyển bàn, Sandbox/Challenge, Trình chiếu, Pause/Resume/Reset, thay nhanh slider, Canvas resize và một phép đo 10 dao động con lắc ghi vào sổ tay. Không ghi nhận tràn ngang ở các trang kiểm tra.         |
| RAF và kích thước Canvas           | Đếm tối đa một callback RAF của ứng dụng chờ khi chạy. Sau Pause, ẩn tab mô phỏng, đổi route và các minh họa tĩnh, số callback chờ bằng 0. Giả lập `visibilitychange` vì Chromium headless vẫn báo tab cũ đang hiện khi mở tab thứ hai.                                              |
| Đo trước và sau chỉnh Canvas       | Trong hai mẫu 1,2 giây ở cùng bàn lò xo và viewport 1366×768, số lần Canvas đọc `getBoundingClientRect` giảm từ 175 trên 175 frame xuống 0 trên 174 frame. Chromium ghi nhận 186 và 185 lượt layout tương ứng. Phép đo xác nhận loại bỏ lượt đọc kích thước, chưa xác nhận tăng FPS. |
| Hosting tĩnh và runtime            | Bản production qua Vite preview tại `/phylab/` và HTTP tĩnh ở root. Đã kiểm tra tài nguyên tương đối, refresh hash, DPR 2 ở root và không ghi nhận lỗi runtime trong luồng Chromium kiểm tra.                                                                                        |

## Demo Phase 3

1. Chạy `pnpm dev` rồi mở `#/oscillator`. Chọn Tắt dần và so sánh b = 1, 8, 12 N·s/m. Đổi sang Cưỡng bức, đặt b = 0 và Ω = 4 rad/s để thấy biên độ tăng. Sang Cộng hưởng, tăng b để quan sát đỉnh dương biến mất.
2. Thử `#/forces` với hai lực cùng độ lớn và lệch 180°. Mở `#/power` để thay thời gian một máy, rồi `#/efficiency` để quan sát phần hao phí và trường hợp lý tưởng 100%.
3. Mở Challenge Lab. Dùng `damping-envelope`, `resonance-frequency`, `oscillation-phenomena`, `force-resultant`, `power-time` và `efficiency-target` sau `#/challenges/` để vào từng bài. Thử một đáp án sai, mở gợi ý và dùng Thử lại.
4. Chạy `pnpm build`. Dùng `pnpm preview --base /phylab/` để demo bản production dưới subpath. Triển khai tĩnh theo hướng dẫn trong README khi đến đợt phát hành.

## Giới hạn và Phase 4

Sandbox dao động nâng cao quan sát tối đa 30 giây vật lý mỗi lần. Tổng hợp lực điều chỉnh qua slider. Đánh giá trên thiết bị thực và kiểm chứng sư phạm trong lớp học thuộc đợt sau. Phase 4 gồm Guided Tour, trải nghiệm giám khảo, đánh giá thực tế, triển khai công khai và chuẩn bị bản STEM 1.0. Các tính năng ngoài phạm vi Phase 3 như tài khoản, backend, AI Tutor và báo cáo PDF đầy đủ được để lại ngoài bản này.

---

# PHYLAB — BÀN GIAO PHASE 2B, 2C VÀ 2D

**Ngày lập** 09/11/2026

## Nội dung và điều hướng

- **Lý thuyết** gồm Định luật Hooke, Moment lực và Công của lực. Mỗi minh họa có công thức, đơn vị và phản hồi tức thời khi đổi tham số.
- **Thí nghiệm** gồm dao động lò xo, chuyển động tròn, ném ngang, con lắc đơn, va chạm và bảo toàn cơ năng. Các bàn động có Sandbox, điều khiển thời gian và Trình chiếu.
- **Challenge Lab** tập hợp 15 bài từ cả hai khu vực. Bảy bài mới gồm ba bài va chạm, hai bài công và hai bài cơ năng. Mỗi bài mở được trực tiếp qua `#/challenges/<id>`.

Metadata `catalog.ts` phân loại nội dung, cung cấp nhãn và điều khiển có dùng thời gian hay không. Trang chủ, menu và workspace đọc chung metadata đó. Các hash Phase 1–2A được giữ lại. `#/spring` vẫn mở Hooke. Challenge Lab mở cùng workspace với bộ thông số và điều kiện chấm từ `challenges/config.ts`.

## Mô hình mới

| Bàn              | Quy tắc vật lý                                                                                                                                                                                                                                           | Cách quan sát                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Va chạm          | Hai xe dài 1,2 m trên ray 20 m, bỏ qua ma sát. Tính tiếp xúc khi khoảng cách hai mép bằng 0 và `v₁ > v₂`. Va chạm đàn hồi đảo vận tốc tương đối trong hệ khối tâm, tương đương hai công thức đàn hồi 1D. Va chạm mềm cho `v′ = (m₁v₁ + m₂v₂)/(m₁ + m₂)`. | Canvas dùng nghiệm trước và sau cùng một mốc tiếp xúc. Cột Sau mở sau va chạm, kèm ΔP và ΔEₖ. Nếu chạm biên hoặc tới 10 s thì đồng hồ dừng. |
| Công của lực     | `A = Fs cos α` cho một lực không đổi và độ dời cho trước. Góc 90° cho công bằng 0 trong dung sai số học.                                                                                                                                                 | Kéo slider để đổi dấu và độ lớn công. Canvas hiển thị lực và độ dời, với độ dài vector được scale để quan sát.                              |
| Bảo toàn cơ năng | Dốc không ma sát, vật thả từ nghỉ. `a = g sin β`, `s = at²/2`, `L = h/sin β`, `t_hit = √(2L/a)`. `Eₖ = ½mv²`, `Eₚ = mgy`, `E = mgh`.                                                                                                                     | Đồng hồ chặn đúng ở chân dốc, tại đó `v = √(2gh)`. Ba thanh năng lượng dùng chung một thang joule.                                          |

## Tệp và cách mở rộng

- `src/simulations/collision/{physics,renderer}.ts` chứa nghiệm va chạm và Canvas hai xe. `src/simulations/energy/{physics,renderer}.ts` chứa công của lực và chuyển động trên dốc.
- `LabWorkspace.tsx`, `SimulationCanvas.tsx`, `ControlPanel.tsx` và `TheoryPanel.tsx` tái sử dụng layout, Canvas và hệ điều khiển. `LabAnalysis.tsx` hiển thị bảng va chạm và thanh năng lượng. Khi trình chiếu, bảng hoặc thanh được đặt cạnh Canvas ở desktop.
- `CatalogSelect.tsx` dùng cùng metadata với `Home.tsx`. Để chỉnh phạm vi slider, sửa `parameterSpecs` trong `catalog.ts` và giữ bộ mặc định cùng các bộ `initial` trong miền hợp lệ. Góc mang đơn vị radian trong physics, đổi sang độ ở slider.
- Thêm thử thách trong `challenges/config.ts` với ID, model, `initial`, `editable`, mục tiêu, dung sai, gợi ý và giải thích. Nếu bài cần một sự kiện hoặc loại câu trả lời mới, mở rộng điều kiện trong `canCheckChallenge` và `validateChallenge`. Thêm test cả đường đúng và đường sai trong `tests/phase2b-c-d.test.ts`.

## Kiểm chứng

- Baseline trước sửa có 60/60 test, TypeScript, production build và Prettier đạt. Sau sửa có 78/78 test, gồm 18 test mới cho vật lý, đồng hồ, Challenge và catalog.
- Bản production tại `/phylab/` đã được thử trên Chromium. Cả 15 Challenge, 10 mốc đo con lắc, đổi loại va chạm, đổi slider, bảng trước/sau và thanh cơ năng hoạt động. Kiểm tra refresh deep link, tài nguyên tương đối và bố cục 1920×1080, 1366×768, 800×900, 390×844.
- Đếm callback RAF trong Chromium cho thấy mỗi lần chạy được kiểm tra có một frame chờ. Số frame chờ trở về 0 sau Pause và khi đổi bàn. Mô hình Công không lên lịch RAF. Trong các luồng kiểm thử không ghi nhận lỗi console hay request về cổng dev khác.
- Rà mã ứng dụng theo các mục đầu vào số, phân giải hash, công thức, quyền truy cập và renderer. Các trang mới phân giải hash qua danh sách route có sẵn, chạy công thức TypeScript và giữ dữ liệu trong trình duyệt. Không thêm dependency.

## Demo và triển khai

1. Chạy `pnpm install` và `pnpm dev`. Vào **Lý thuyết → Công của lực**, lần lượt chọn 0°, 90° và 180° để so sánh dấu.
2. Vào **Thí nghiệm → Động lượng và va chạm**, chạy cùng bộ tham số với va chạm đàn hồi và va chạm mềm. So sánh cột Trước/Sau và phần động năng chuyển hóa.
3. Mở **Bảo toàn cơ năng**, đặt m = 1 kg, h = 5 m, g = 10 m/s² rồi bật **Trình chiếu**. Theo dõi 50 J chuyển từ thế năng sang động năng. Vận tốc tại chân dốc là 10 m/s.
4. Mở **Challenge Lab** để chọn nhiệm vụ. Với bài dự đoán động, nhập đáp án trước Play và kiểm tra sau mốc vật lý được yêu cầu.
5. Chạy `pnpm build` để tạo `dist/`. Dùng `pnpm preview --base /phylab/` để thử dưới subpath. `base: './'` và hash routing tiếp tục hỗ trợ GitHub Pages và Cloudflare Pages. Cấu hình `wrangler.jsonc` dùng `dist/` khi deploy bằng Cloudflare Workers.

## Giới hạn

Va chạm xét chuyển động một chiều và tối đa một lần tiếp xúc giữa hai xe. Khi đồng hồ dừng ở biên ray hoặc chân dốc, số liệu giữ trạng thái ngay tại mốc quan sát. Việc kiểm chứng giao diện của đợt này thực hiện bằng Chromium, với các kích thước màn hình mô phỏng. Bản build kiểm thử chạy local.

---

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
