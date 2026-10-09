/**
 * Minimal rotatable orthographic 3-D view for canvas scenes: yaw spins around the vertical
 * x₃ axis, pitch tilts the camera up/down. Drag to rotate.
 */
import { alpha, dot, label, type VizTheme } from '#lib/viz/canvas.ts';

export type P3 = [number, number, number];
export interface View3 {
	yaw: number;
	pitch: number;
}

export interface Projected {
	x: number;
	y: number;
	/** Larger = closer to the camera. */
	depth: number;
}

/** Rotate a point into camera space: x right, y up, depth towards the viewer. */
export function rotate([x, y, z]: P3 | number[], v: View3): Projected {
	const cy = Math.cos(v.yaw);
	const sy = Math.sin(v.yaw);
	const a = x * cy - y * sy;
	const b = x * sy + y * cy;
	const cp = Math.cos(v.pitch);
	const sp = Math.sin(v.pitch);
	return { x: a, y: z * cp + b * sp, depth: z * sp - b * cp };
}

/** Screen-space projector: centre (cx, cy) in pixels, `scale` pixels per data unit. */
export function projector(v: View3, cx: number, cy: number, scale: number) {
	return (p: P3 | number[]) => {
		const r = rotate(p, v);
		return { x: cx + r.x * scale, y: cy - r.y * scale, depth: r.depth };
	};
}

/** Draw the three data axes from the origin with labels. */
export function drawAxes(
	ctx: CanvasRenderingContext2D,
	t: VizTheme,
	proj: (p: P3) => Projected,
	len: number,
	names = ['x₁', 'x₂', 'x₃']
) {
	const o = proj([0, 0, 0]);
	const ends: P3[] = [
		[len, 0, 0],
		[0, len, 0],
		[0, 0, len]
	];
	ctx.lineWidth = 1;
	ends.forEach((e, i) => {
		const n = proj([-e[0], -e[1], -e[2]]);
		const p = proj(e);
		ctx.strokeStyle = t.axis;
		ctx.setLineDash([3, 4]);
		ctx.beginPath();
		ctx.moveTo(n.x, n.y);
		ctx.lineTo(o.x, o.y);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.beginPath();
		ctx.moveTo(o.x, o.y);
		ctx.lineTo(p.x, p.y);
		ctx.stroke();
		label(ctx, t, names[i], p.x + (p.x >= o.x ? 6 : -6), p.y, {
			color: t.text3,
			size: 11,
			align: p.x >= o.x ? 'left' : 'right'
		});
	});
}

/** Points sorted far → near, drawn with a slight depth cue. */
export function drawCloud(
	ctx: CanvasRenderingContext2D,
	proj: (p: P3) => Projected,
	pts: (P3 | number[])[],
	color: (i: number) => string,
	r = 3.2,
	opts: { highlight?: (i: number) => boolean; bg?: string } = {}
) {
	const ps = pts.map((p, i) => ({ ...proj(p as P3), i }));
	let lo = Infinity;
	let hi = -Infinity;
	for (const p of ps) {
		lo = Math.min(lo, p.depth);
		hi = Math.max(hi, p.depth);
	}
	const span = hi - lo || 1;
	ps.sort((a, b) => a.depth - b.depth);
	for (const p of ps) {
		const f = (p.depth - lo) / span; // 0 far … 1 near
		const c = color(p.i);
		const hl = opts.highlight?.(p.i);
		dot(ctx, p.x, p.y, (hl ? r + 2 : r) * (0.8 + 0.35 * f), alpha(c, 0.45 + 0.5 * f), hl ? opts.bg : undefined, 1.5);
	}
	return ps;
}

/** Pointer handlers that rotate `v` while dragging. Returns true from move() when it rotated. */
export function rotator(get: () => View3 | null, onrotate?: () => void) {
	let last: { x: number; y: number } | null = null;
	return {
		down(p: { x: number; y: number }) {
			last = p;
		},
		move(p: { x: number; y: number }) {
			const v = get();
			if (!last || !v) return false;
			v.yaw += (p.x - last.x) * 0.012;
			v.pitch = Math.max(-1.45, Math.min(1.45, v.pitch + (p.y - last.y) * 0.012));
			last = p;
			onrotate?.();
			return true;
		},
		up() {
			last = null;
		},
		get active() {
			return last !== null;
		}
	};
}
