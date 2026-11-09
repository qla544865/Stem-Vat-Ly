export const ink = '#384f55';
export const teal = '#0b8f82';
export function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = '#b9c9c7',
  dash: number[] = [],
) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash(dash);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}
export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = ink,
  align: CanvasTextAlign = 'center',
  size = 12,
) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.font = `${size}px "Segoe UI", sans-serif`;
  ctx.fillText(text, x, y);
}
export function arrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: string,
) {
  const length = Math.hypot(dx, dy);
  if (length < 1) return;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx, y + dy);
  ctx.stroke();
  const angle = Math.atan2(dy, dx);
  const head = Math.min(7, length * 0.4);
  ctx.beginPath();
  ctx.moveTo(x + dx, y + dy);
  ctx.lineTo(x + dx - head * Math.cos(angle - 0.45), y + dy - head * Math.sin(angle - 0.45));
  ctx.lineTo(x + dx - head * Math.cos(angle + 0.45), y + dy - head * Math.sin(angle + 0.45));
  ctx.closePath();
  ctx.fill();
}
