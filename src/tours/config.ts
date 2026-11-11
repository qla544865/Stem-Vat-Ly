import { catalog, isDynamic } from '../simulations/catalog.ts';
import type { LabRoute } from '../simulations/catalog.ts';

export interface TourStep {
  title: string;
  content: string;
  target: string;
  view?: 'practice' | 'results';
}
export interface Tour {
  id: string;
  version: number;
  title: string;
  steps: TourStep[];
}
const step = (
  title: string,
  content: string,
  target: string,
  view?: TourStep['view'],
): TourStep => ({ title, content, target, view });
export const challengeTour: Tour = {
  id: 'challenge',
  version: 1,
  title: 'Khám phá Challenge Lab',
  steps: [
    step(
      'Chọn thử thách',
      'Chọn bài ở danh sách Challenge Lab hoặc bộ chọn trong bảng nhiệm vụ.',
      '.challenge-card, .challenge-index-grid',
    ),
    step(
      'Đọc yêu cầu',
      'Đọc mục tiêu và giới hạn. Chỉ các tham số được mở khóa mới được thay đổi.',
      '.challenge-card',
    ),
    step(
      'Dự đoán và kiểm chứng',
      'Nếu bài yêu cầu dự đoán, hãy nhập trước khi chạy. Với minh họa tĩnh, chỉ cần điều chỉnh tham số; không cần Play.',
      '.challenge-card',
    ),
    step(
      'Kiểm tra kết quả',
      'Chờ đủ điều kiện ghi trong bảng nhiệm vụ rồi bấm Kiểm tra kết quả. Hướng dẫn không tiết lộ đáp án.',
      '.challenge-card',
    ),
    step(
      'Gợi ý và thử lại',
      'Dùng Gợi ý khi cần. Thử lại sẽ bắt đầu lượt mới; chỉ bấm khi bạn muốn đặt lại lượt làm bài.',
      '.challenge-card',
    ),
  ],
};
export const pendulumTour: Tour = {
  id: 'pendulum',
  version: 1,
  title: 'Khám phá con lắc đơn',
  steps: [
    step(
      'Mục tiêu khảo sát',
      'Khảo sát chu kỳ phụ thuộc chiều dài, khối lượng và góc thả như thế nào. Phân biệt chu kỳ phi tuyến T với gần đúng góc nhỏ T₀.',
      '.pendulum-stage',
    ),
    step(
      'Điều chỉnh tham số',
      'Trong Sandbox, chỉnh chiều dài, khối lượng, góc thả và g. Mỗi lần đổi tham số đưa mô phỏng về t = 0; các hàng thực hành đã ghi vẫn được giữ.',
      '.control-card',
    ),
    step(
      'Kéo quả nặng',
      'Dùng chuột hoặc cảm ứng kéo quả nặng rồi thả. Bạn cũng có thể chỉnh góc bằng slider khi dùng bàn phím.',
      '.pendulum-stage canvas',
    ),
    step(
      'Điều khiển thời gian',
      'Bắt đầu / Tạm dừng giữ thời gian hiện tại. Nút đặt lại đưa thời gian về 0. Tốc độ 2× chỉ rút ngắn thời gian chờ, không đổi chu kỳ vật lý.',
      '.playback-controls',
    ),
    step(
      'Mở phiếu thực hành',
      'Chuyển sang Thực hành bằng nút bên dưới hoặc thanh chế độ. Việc chuyển chế độ dừng lượt chạy hiện tại, giữ các kết quả đã ghi.',
      '.pendulum-nav',
      'practice',
    ),
    step(
      'Đo và ghi số liệu',
      'Chọn bài, viết dự đoán, chọn mốc và bấm Đo 10 dao động. Chờ đủ 10 rồi Ghi kết quả. Lặp lại với từng mốc; hướng dẫn không tự đo hoặc ghi đè dữ liệu.',
      '.pendulum-panel',
    ),
    step(
      'Đồ thị và kết luận',
      'Mở Kết quả & đồ thị để so sánh số liệu. Ít nhất hai chiều dài cho phép fit T²–l qua gốc và suy ra g. Viết kết luận dựa trên các phép đo của bạn.',
      '.pendulum-nav',
      'results',
    ),
  ],
};
export function tourFor(model: LabRoute): Tour {
  if (model === 'pendulum') return pendulumTour;
  const item = catalog[model];
  const dynamic = isDynamic(model);
  return {
    id: model,
    version: 1,
    title: item.title,
    steps: [
      step(
        dynamic ? 'Hiện tượng cần quan sát' : 'Minh họa tương tác',
        dynamic
          ? item.description
          : `${item.description} Đây là minh họa tương tác, không phải mô phỏng chuyển động theo thời gian.`,
        '.simulation-card',
      ),
      step(
        'Thay đổi tham số',
        dynamic
          ? 'Thay từng tham số để so sánh. Mô phỏng sẽ dừng và trở về t = 0 khi bạn đổi tham số.'
          : 'Kéo slider để cập nhật ngay hình vẽ và kết quả. Không cần Play/Pause cho mô hình tĩnh.',
        '.control-card',
      ),
      ...(dynamic
        ? [
            step(
              'Chạy và quan sát',
              'Dùng Bắt đầu, Tạm dừng, đặt lại và tốc độ. Đối chiếu hình vẽ với số liệu; tốc độ phát không thay đổi thời gian vật lý.',
              '.playback-controls',
            ),
          ]
        : []),
      step(
        'Đọc kết quả',
        `Đọc số liệu có đơn vị và công thức bên dưới. ${item.tags.join(' · ')}. Thử dự đoán trước khi đổi tham số.`,
        '.stats-grid',
      ),
    ],
  };
}

const seen = new Set<string>();
export const tourStorageKey = (tour: Tour) => `phylab:tour:${tour.id}:v${tour.version}`;
export function hasSeenTour(tour: Tour): boolean {
  const key = tourStorageKey(tour);
  if (seen.has(key)) return true;
  try {
    return localStorage.getItem(key) === 'seen';
  } catch {
    return false;
  }
}
export function markTourSeen(tour: Tour) {
  const key = tourStorageKey(tour);
  seen.add(key);
  try {
    localStorage.setItem(key, 'seen');
  } catch {
    /* Session fallback is sufficient. */
  }
}
