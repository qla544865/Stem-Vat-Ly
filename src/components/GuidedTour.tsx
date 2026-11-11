import { useEffect, useRef, useState } from 'react';
import type { Tour, TourStep } from '../tours/config.ts';
import { hasSeenTour, markTourSeen } from '../tours/config.ts';

// A nonmodal guide keeps the target controls and page navigation usable.
export default function GuidedTour({
  tour,
  context = '',
  onNavigate,
}: {
  tour: Tour;
  context?: string;
  onNavigate?: (view: NonNullable<TourStep['view']>) => void;
}) {
  const [invite, setInvite] = useState(() => !hasSeenTour(tour));
  const [index, setIndex] = useState<number | null>(null);
  const [missing, setMissing] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const ownNavigation = useRef(false);
  const current = index === null ? null : tour.steps[index];
  function dismiss() {
    markTourSeen(tour);
    setInvite(false);
    setIndex(null);
    if (trigger.current?.isConnected) trigger.current.focus();
    else launcher.current?.focus();
  }
  useEffect(() => {
    if (ownNavigation.current) {
      ownNavigation.current = false;
      return;
    }
    if (panel.current?.contains(document.activeElement)) launcher.current?.focus();
    setIndex(null);
  }, [context]);
  useEffect(() => {
    if (!current) return;
    panel.current?.focus();
    let target: HTMLElement | null = null;
    function locate(scroll = false) {
      const next =
        Array.from(document.querySelectorAll<HTMLElement>(current!.target)).find(
          (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden',
        ) ?? null;
      if (next !== target) {
        target?.classList.remove('tour-target');
        target = next;
        target?.classList.add('tour-target');
      }
      setMissing(!target);
      if (scroll) target?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    locate(true);
    const update = () => locate();
    const observer = new MutationObserver(update);
    observer.observe(document.querySelector('main') ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden', 'style', 'class'],
    });
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', escape);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      target?.classList.remove('tour-target');
      observer.disconnect();
      window.removeEventListener('keydown', escape);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [current]);
  useEffect(
    () => () => {
      if (panel.current?.contains(document.activeElement) && trigger.current?.isConnected)
        trigger.current.focus();
    },
    [],
  );
  return (
    <>
      <div className="tour-entry">
        {invite && <span> Lần đầu khám phá? Xem hướng dẫn ngắn ngay trên giao diện.</span>}
        <button
          className="lab-presentation-button"
          ref={launcher}
          onClick={(event) => {
            trigger.current = event.currentTarget;
            markTourSeen(tour);
            setInvite(false);
            setIndex(0);
          }}
        >
          {' '}
          {invite ? 'Bắt đầu hướng dẫn' : 'Hướng dẫn'}{' '}
        </button>
        {invite && (
          <button className="text-button" onClick={dismiss}>
            Bỏ qua
          </button>
        )}
      </div>
      {current && (
        <aside
          className="tour-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="tour-heading"
          aria-describedby="tour-content"
          ref={panel}
          tabIndex={-1}
        >
          <div className="tour-panel-heading">
            <span>
              {tour.title} · Bước {index! + 1}/{tour.steps.length}
            </span>
            <button aria-label="Đóng hướng dẫn" onClick={dismiss}>
              ×
            </button>
          </div>
          <h2 id="tour-heading">{current.title}</h2>
          <p id="tour-content">{current.content}</p>
          {missing && (
            <p role="status">
              Vùng này đang ẩn hoặc thuộc chế độ khác. Bạn có thể chuyển chế độ, tiếp tục hoặc đóng
              hướng dẫn.
            </p>
          )}
          {current.view && onNavigate && (
            <button
              className="text-button"
              onClick={() => {
                ownNavigation.current = context.split(':')[0] !== current.view;
                onNavigate(current.view!);
              }}
            >
              Mở {current.view === 'practice' ? 'Thực hành' : 'Kết quả & đồ thị'}
            </button>
          )}
          <div className="tour-actions">
            <button disabled={index === 0} onClick={() => setIndex(index! - 1)}>
              Quay lại
            </button>
            <button onClick={dismiss}>Bỏ qua</button>
            <button
              className="primary-button"
              onClick={() => (index === tour.steps.length - 1 ? dismiss() : setIndex(index! + 1))}
            >
              {index === tour.steps.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
