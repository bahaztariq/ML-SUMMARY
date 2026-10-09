import { describe, expect, it } from 'vitest';
import { mulberry32 } from '#lib/viz/canvas.ts';
import * as dt from '../decision-tree/tree.ts';
import * as rf from './forest.ts';
import * as st from './state.ts';

const train = rf.makeData(33, 200, 0.12);
const test = rf.makeData(1010, 600, 0.12);
const forestAcc = (f: rf.Forest, B = f.trees.length) =>
	rf.accuracyOf(
		test.X.map((p) => rf.vote(rf.voteShare(f.trees, p, B))),
		test.y
	);

describe('random forest', () => {
	it('a bootstrap sample has n rows and leaves out about 1/e of them', () => {
		const rand = mulberry32(1);
		let out = 0;
		for (let r = 0; r < 50; r++) {
			const idx = rf.bootstrap(1000, rand);
			expect(idx.length).toBe(1000);
			out += rf.multiplicity(1000, idx).filter((k) => k === 0).length;
		}
		expect(out / 50 / 1000).toBeCloseTo(Math.exp(-1), 1);
	});

	it('trees grown on different bootstrap samples differ', () => {
		const f = rf.fitForest(train, { nTrees: 2, bootstrap: true, maxFeatures: 1, seed: 5 });
		const a = test.X.map((p) => dt.predict(f.trees[0], p));
		const b = test.X.map((p) => dt.predict(f.trees[1], p));
		expect(a.some((v, i) => v !== b[i])).toBe(true);
	});

	it('without bootstrap and with all features every tree is the same tree', () => {
		const f = rf.fitForest(train, { nTrees: 5, bootstrap: false, maxFeatures: 2, seed: 5 });
		const preds = f.trees.map((t) => test.X.map((p) => dt.predict(t, p)));
		for (const p of preds) expect(p).toEqual(preds[0]);
		expect(rf.meanCorrelation(preds)).toBeCloseTo(1);
	});

	it('a forest beats a single deep tree on test data', () => {
		const single = dt.fit(train);
		const f = rf.fitForest(train, { nTrees: 100, bootstrap: true, maxFeatures: 1, seed: 5 });
		expect(dt.accuracy(single, train)).toBe(1);
		expect(forestAcc(f)).toBeGreaterThan(dt.accuracy(single, test) + 0.05);
	});

	it('random feature subsets lower the correlation between trees', () => {
		const corr = (m: 1 | 2) => {
			const f = rf.fitForest(train, { nTrees: 25, bootstrap: true, maxFeatures: m, seed: 5 });
			return rf.meanCorrelation(f.trees.map((t) => test.X.map((p) => dt.predict(t, p))));
		};
		expect(corr(1)).toBeLessThan(corr(2));
	});

	it('out-of-bag accuracy only uses trees that did not see the row and tracks test accuracy', () => {
		const f = rf.fitForest(train, { nTrees: 100, bootstrap: true, maxFeatures: 1, seed: 5 });
		const oob = rf.oobAccuracy(f, train);
		expect(oob.counted).toBe(200);
		expect(Math.abs(oob.acc - forestAcc(f))).toBeLessThan(0.07);
		// a tree that saw every row contributes nothing
		const all = { trees: [f.trees[0]], inBag: [new Array(200).fill(1)] };
		expect(rf.oobAccuracy(all, train).counted).toBe(0);
	});
});

describe('vote grid rasterisation', () => {
	it('matches predicting every cell', () => {
		for (const t of [0, 1, 7]) {
			const node = st.tree({ seed: 33, maxFeatures: 1, bootstrap: true, maxDepth: st.UNLIMITED }, t);
			expect(Array.from(st.gridOf(node))).toEqual(Array.from(st.gridOfSlow(node)));
		}
	});
});
