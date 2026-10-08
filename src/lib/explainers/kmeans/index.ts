/**
 * Guided explainer: how K-Means finds clusters.
 */
import { fmt } from '#lib/viz/canvas.ts';
import type { ExplainerModule } from '../types';
import Scene from './Scene.svelte';
import {
	BAD_SEED,
	GOOD_SEED,
	currentInertia,
	doAssign,
	doUpdate,
	init,
	off,
	place,
	runAll,
	setData,
	type KMeansState
} from './state';

const explainer: ExplainerModule<KMeansState> = {
	title: 'How K-Means finds clusters',
	init,
	Scene,
	steps: [
		{
			title: 'Points without labels',
			body: `Here are 280 points, for example customers plotted by *visits per month* and *average basket size*. Nobody has told us which group each point belongs to.

Your eye spots a few clumps right away. K-Means finds them by repeating **two simple moves** over and over.`
		},
		{
			title: 'Pick K, drop K centroids',
			body: `K-Means needs one thing from you up front: **K**, the number of clusters. Here K = 4.

It starts by placing K **centroids** (the large markers) on randomly chosen points. They don't mean anything yet. They're guesses that will move.`,
			enter: (s) => {
				s.k = 4;
				s.initSeed = GOOD_SEED;
				place(s);
			}
		},
		{
			title: 'Move 1: assign',
			body: `Every point joins the **nearest centroid** and takes its color. The shaded areas show which centroid owns each part of the plane.

This step only changes the labels. The centroids stay where they are.`,
			enter: (s) => {
				doAssign(s);
				s.show.regions = true;
				s.show.links = true;
				s.ui.drag = true;
			},
			task: {
				prompt: 'Drag a centroid around and watch points switch sides as it moves.',
				done: (s) => s.did.drag
			}
		},
		{
			title: 'Move 2: update',
			body: (s) => `Each centroid jumps to the **average position** of the points that just joined it. The faint line shows how far each one moved.

K-Means scores a clustering by its **inertia**: the total squared distance from every point to its centroid. Lower means tighter clusters. Inertia is now **${fmt(currentInertia(s))}**.`,
			enter: (s) => {
				s.show.links = false;
				s.show.trails = true;
				s.ui.drag = false;
				doUpdate(s);
			}
		},
		{
			title: 'Repeat until nothing changes',
			body: (s) => `Now assign, update, assign, update… Each move can only lower the inertia (or leave it the same), so the process always stops: eventually no point switches cluster.

${s.converged ? `**Converged after ${s.iteration} iterations** with inertia ${fmt(currentInertia(s))}.` : `Iteration **${s.iteration}**, inertia **${fmt(currentInertia(s))}**.`}`,
			enter: (s) => {
				s.ui.step = true;
				s.ui.run = true;
			},
			task: { prompt: 'Press **Run** (or **Step** repeatedly) until K-Means converges.', done: (s) => s.converged }
		},
		{
			title: 'Is that always the best answer?',
			body: `Go back two steps and look at where the centroids started: two of them began in the same clump, and none in the bottom-right one. K-Means still sorted it out this time.`,
			enter: (s) => {
				s.ui = { ...off };
				runAll(s);
			},
			quiz: {
				question: 'Does K-Means always recover from a bad start like that?',
				options: [
					'Yes: inertia keeps dropping, so it always reaches the best clustering',
					'No: it can converge to a clearly worse answer',
					'Only if you let it run for enough iterations'
				],
				answer: 1,
				explain: (s) =>
					`K-Means only ever moves **downhill** from where it starts, so it can settle in a *local minimum*, and more iterations won't help once nothing changes. This run started differently: one real cluster got split in two while two others were merged. Final inertia is **${fmt(currentInertia(s))}**, about 3× worse than before.`,
				reveal: (s) => {
					s.initSeed = BAD_SEED;
					place(s);
					runAll(s);
				}
			}
		},
		{
			title: 'The fix: k-means++ and several restarts',
			body: `Two standard defences, both on by default in scikit-learn:

**k-means++** picks starting centroids that are far apart: each new one is drawn with probability proportional to its squared distance from the centroids already chosen.

**n_init** runs the whole algorithm several times from different starts and keeps the run with the lowest inertia.`,
			enter: (s) => {
				s.initMethod = 'plusplus';
				s.initSeed = 1;
				place(s);
				runAll(s);
				s.ui.restart = true;
				s.ui.init = true;
			},
			task: {
				prompt: 'Switch between **Random** and **k-means++** and press **New start** a few times. Which one gets stuck more often?',
				done: (s) => s.initSeed > 3
			}
		},
		{
			title: 'Choosing K: the elbow',
			body: (s) => `What if you don't know K? Inertia **always** drops as K grows (with K = 280, every point is its own cluster and inertia is 0), so you can't just pick the lowest.

Instead, plot inertia against K and look for the **elbow**: the point where adding another cluster stops buying much. Current K = **${s.k}**.`,
			enter: (s) => {
				s.ui = { ...off, k: true };
				s.show.elbow = true;
				s.initMethod = 'plusplus';
				s.k = 2;
				place(s);
				runAll(s);
			},
			task: {
				prompt: 'Use the K slider (or click the elbow chart) to set K at the elbow.',
				done: (s) => s.k === 4
			}
		},
		{
			title: 'Where K-Means breaks',
			body: `K-Means draws **straight boundaries** halfway between centroids, so it assumes clusters are round blobs of similar size.

On these two interlocking moons it cuts straight across both shapes. For shapes like this, use [DBSCAN](concept:dbscan), which follows density. For stretched or overlapping blobs, a [Gaussian Mixture](concept:gmm) works better.`,
			enter: (s) => {
				s.ui = { ...off, dataset: true };
				s.show.elbow = false;
				s.show.trails = false;
				s.initMethod = 'plusplus';
				s.initSeed = 1;
				s.k = 2;
				setData(s, 'moons');
				place(s);
				runAll(s);
			},
			task: {
				prompt: 'Try the **Uneven** dataset too: one big spread-out cluster and three tight ones.',
				done: (s) => s.dataset === 'uneven'
			}
		},
		{
			title: 'Your turn: playground',
			body: `Everything is unlocked. Recap:

1. Pick K and place K starting centroids (use k-means++).
2. **Assign** each point to its nearest centroid.
3. **Update** each centroid to the mean of its points.
4. Repeat 2–3 until no point changes cluster.

Remember to **scale your features** first. K-Means uses raw distances, so a feature measured in thousands drowns out one measured in fractions.`,
			enter: (s) => {
				s.ui = { drag: true, step: true, run: true, restart: true, k: true, init: true, dataset: true };
				s.show = { regions: true, links: false, trails: true, elbow: true };
				setData(s, 'blobs');
				s.k = 4;
				s.initMethod = 'plusplus';
				s.initSeed = 5;
				place(s);
			}
		}
	]
};

export default explainer;
