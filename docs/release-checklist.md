# Checklist phát hành PhyLab 1.0

Bản làm việc: `1.0.0-rc.1`. Dùng checklist này để nghiệm thu trước khi phát hành. Kết quả kiểm thử local không thay thế kiểm thử URL công khai hay lớp học.

## Build và regression

- [x] Baseline ghi nhận trên repo trước khi chỉnh: 95/95 test, TypeScript, Prettier và production build đạt.
- [x] Regression tự động: 99/99 test, kiểm tra vật lý, đồng hồ, Challenge, điều hướng và dữ liệu demo.
- [x] TypeScript và `pnpm build` đạt; `dist/` là artifact tĩnh.
- [x] `pnpm format:check` và `git diff --check` đạt.
- [x] Smoke test 21 Challenge, tour, demo và trình chiếu; không có lỗi console nghiêm trọng trong các luồng đã thử.
- [x] Kiểm tra root/subpath, tài nguyên và refresh deep link bằng máy chủ tĩnh local.
- [x] Không thêm dependency ứng dụng, biến môi trường hay dịch vụ phía máy chủ; quét mẫu token/key phổ biến trong source và artifact không ghi nhận kết quả.
- [x] README, HANDOVER và bộ tài liệu đánh giá đã có.

## Nghiệm thu tại lớp

- [ ] Kiểm tra đọc số liệu và điều khiển ở khoảng cách sử dụng thực tại máy chiếu 1920×1080, 1366×768 hoặc 1280×720.
- [ ] Giáo viên rà nội dung vật lý và làm thử kịch bản trình chiếu.
- [ ] Tổ chức buổi thử theo [kế hoạch đánh giá](evaluation-plan.md), lưu kết quả ẩn danh và ưu tiên vấn đề có bằng chứng.

## Xuất bản và kiểm chứng URL

- [ ] Chốt commit, tên miền/đích deploy và quyền truy cập; lưu artifact trước để có thể quay lại.
- [ ] GitHub Pages: build với lockfile, xuất `dist/` bằng Pages artifact; kiểm tra dưới subpath của repository và Enforce HTTPS. Xem [tài liệu GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [ ] Cloudflare Pages: Node 24, build `pnpm build`, output `dist`, hoặc upload `dist/`; kiểm tra URL `pages.dev` và HTTPS. Xem [cấu hình Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/).
- [ ] Trên đích phát hành đã chọn, mở trang chủ, tour, `#/pendulum`, `#/oscillator` và một Challenge trực tiếp; refresh từng hash và kiểm tra JS/CSS/favicon trả về thành công, không có mixed content.
- [ ] Chỉ gắn tag công khai và công bố URL 1.0 sau khi xác minh bản deploy đúng commit hoạt động qua HTTPS. Nếu cần quay lại, triển khai lại artifact đã lưu và kiểm tra lại deep link.

Đường dẫn `workers.dev` trong README trỏ đến bản trước. `wrangler.jsonc` phục vụ Workers Static Assets, không phải cấu hình Cloudflare Pages. Phase 4 chưa deploy lên GitHub Pages, Cloudflare Pages hoặc URL production khác.
