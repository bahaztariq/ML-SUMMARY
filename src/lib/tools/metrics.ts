/**
 * Binary classification metrics from a confusion matrix.
 * A metric whose denominator is zero is undefined and returned as null (not silently 0).
 */
import type { Lang } from '#lib/i18n/index.svelte.ts';

export interface Counts {
	tp: number;
	fp: number;
	fn: number;
	tn: number;
}

export type MetricKey = 'accuracy' | 'precision' | 'recall' | 'specificity' | 'f1' | 'mcc';

export type Metrics = Record<MetricKey, number | null> & { total: number; prevalence: number | null };

const ratio = (num: number, den: number) => (den > 0 ? num / den : null);

export function computeMetrics({ tp, fp, fn, tn }: Counts): Metrics {
	const total = tp + fp + fn + tn;
	const precision = ratio(tp, tp + fp);
	const recall = ratio(tp, tp + fn);
	// F1 = 2TP / (2TP + FP + FN): defined whenever there is any positive (actual or predicted).
	const f1 = ratio(2 * tp, 2 * tp + fp + fn);
	const den = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
	const mcc = den > 0 ? (tp * tn - fp * fn) / den : null;
	return {
		total,
		prevalence: ratio(tp + fn, total),
		accuracy: ratio(tp + tn, total),
		precision,
		recall,
		specificity: ratio(tn, tn + fp),
		f1,
		mcc
	};
}

export interface MetricInfo {
	key: MetricKey;
	name: string;
	alias?: string;
	formula: string;
	question: string;
	/** MCC ranges over [-1, 1]; the others over [0, 1]. */
	signed?: boolean;
}

export const metricInfo: MetricInfo[] = [
	{
		key: 'accuracy',
		name: 'Accuracy',
		formula: '(TP + TN) / Total',
		question: 'Out of everything, how much did the model get right? Misleading when one class is rare.'
	},
	{
		key: 'precision',
		name: 'Precision',
		alias: 'Positive predictive value',
		formula: 'TP / (TP + FP)',
		question: 'When the model says "positive", how often is it right? Low precision means many false alarms.'
	},
	{
		key: 'recall',
		name: 'Recall',
		alias: 'Sensitivity, TPR',
		formula: 'TP / (TP + FN)',
		question: 'Of all real positives, how many did the model catch? Low recall means missed cases.'
	},
	{
		key: 'specificity',
		name: 'Specificity',
		alias: 'True negative rate',
		formula: 'TN / (TN + FP)',
		question: 'Of all real negatives, how many were correctly left alone?'
	},
	{
		key: 'f1',
		name: 'F1 score',
		formula: '2 · P · R / (P + R)',
		question: 'One number balancing precision and recall (their harmonic mean). Drops if either one is low.'
	},
	{
		key: 'mcc',
		name: 'MCC',
		alias: 'Matthews correlation',
		formula: '(TP·TN − FP·FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))',
		question: 'Correlation between predictions and truth, using all four cells: 1 is perfect, 0 is a coin flip, −1 is always wrong.',
		signed: true
	}
];

export interface Preset {
	id: string;
	icon: string;
	label: string;
	counts: Counts;
	focus: MetricKey[];
	why: string;
}

export const presets: Preset[] = [
	{
		id: 'medical',
		icon: '🏥',
		label: 'Medical screening',
		counts: { tp: 85, fp: 40, fn: 2, tn: 873 },
		focus: ['recall'],
		why: 'Missing a sick patient (a false negative) is far worse than a false alarm that a follow-up test will clear. Push recall up, even at the cost of precision.'
	},
	{
		id: 'spam',
		icon: '🛡️',
		label: 'Email spam filter',
		counts: { tp: 150, fp: 1, fn: 35, tn: 814 },
		focus: ['precision'],
		why: 'Sending an important email to the spam folder (a false positive) is worse than letting a little spam through. Keep precision close to 100%.'
	},
	{
		id: 'balanced',
		icon: '⚖️',
		label: 'Balanced dataset',
		counts: { tp: 120, fp: 20, fn: 25, tn: 335 },
		focus: ['f1', 'accuracy'],
		why: 'When both classes are common and both mistakes cost about the same, accuracy is a fair summary and F1 confirms the positive class is handled well.'
	},
	{
		id: 'rare',
		icon: '🔎',
		label: 'Rare-event trap',
		counts: { tp: 0, fp: 0, fn: 10, tn: 990 },
		focus: ['recall', 'mcc'],
		why: 'A model that always predicts "negative" scores 99% accuracy on 1% fraud, yet catches nothing. Recall, F1 and MCC expose it immediately.'
	}
];

/** Format a metric for display; undefined metrics render as an em dash. French uses a decimal comma. */
export function formatMetric(v: number | null, signed = false, lang: Lang = 'en'): string {
	if (v === null || !Number.isFinite(v)) return '—';
	const s = signed ? v.toFixed(2) : `${(v * 100).toFixed(1)}%`;
	return lang === 'fr' ? s.replace('.', ',').replace('%', '\u202f%') : s;
}

/* ---------------------------------------------------------------- translations */

type MetricText = Partial<Pick<MetricInfo, 'name' | 'alias' | 'question'>>;
type PresetText = Partial<Pick<Preset, 'label' | 'why'>>;

const metricTexts: Partial<Record<Lang, Partial<Record<MetricKey, MetricText>>>> = {
	fr: {
		accuracy: {
			name: 'Exactitude',
			alias: 'Accuracy',
			question:
				'Sur l’ensemble des cas, quelle part le modèle a-t-il bien classée\u00a0? Trompeuse quand une classe est rare.'
		},
		precision: {
			name: 'Précision',
			alias: 'Valeur prédictive positive',
			question:
				'Quand le modèle dit «\u00a0positif\u00a0», à quelle fréquence a-t-il raison\u00a0? Une faible précision signifie beaucoup de fausses alertes.'
		},
		recall: {
			name: 'Rappel',
			alias: 'Sensibilité, TVP',
			question:
				'Parmi tous les vrais positifs, combien le modèle en a-t-il détecté\u00a0? Un faible rappel signifie des cas manqués.'
		},
		specificity: {
			name: 'Spécificité',
			alias: 'Taux de vrais négatifs',
			question: 'Parmi tous les vrais négatifs, combien ont été correctement laissés de côté\u00a0?'
		},
		f1: {
			name: 'Score F1',
			question:
				'Un seul nombre qui équilibre précision et rappel (leur moyenne harmonique). Il chute si l’un des deux est faible.'
		},
		mcc: {
			name: 'MCC',
			alias: 'Corrélation de Matthews',
			question:
				'Corrélation entre prédictions et réalité, à partir des quatre cases\u00a0: 1 est parfait, 0 vaut un tirage à pile ou face, −1 se trompe toujours.'
		}
	},
	ar: {
		accuracy: {
			name: 'الدقة الإجمالية',
			alias: 'Accuracy',
			question: 'من بين كل الحالات، ما نسبة ما أصاب فيه النموذج؟ مضلِّلة عندما تكون إحدى الفئات نادرة.'
		},
		precision: {
			name: 'الضبط',
			alias: 'Precision',
			question: 'عندما يقول النموذج «موجب»، كم مرة يكون محقًا؟ يعني الضبط المنخفض كثرة الإنذارات الكاذبة.'
		},
		recall: {
			name: 'الاستدعاء',
			alias: 'Recall، الحساسية، TPR',
			question: 'من بين كل الحالات الموجبة الحقيقية، كم حالة التقطها النموذج؟ يعني الاستدعاء المنخفض حالات فائتة.'
		},
		specificity: {
			name: 'النوعية',
			alias: 'Specificity، معدل السلبيات الصحيحة',
			question: 'من بين كل الحالات السالبة الحقيقية، كم حالة تُركت جانبًا بشكل صحيح؟'
		},
		f1: {
			name: 'مقياس F1',
			alias: 'F1 score',
			question: 'رقم واحد يوازن بين الضبط والاستدعاء (وسطهما التوافقي). ينخفض إذا كان أيٌّ منهما منخفضًا.'
		},
		mcc: {
			name: 'MCC',
			alias: 'معامل ارتباط ماثيوز',
			question:
				'الارتباط بين التنبؤات والحقيقة باستخدام الخلايا الأربع كلها: 1 مثالي، و0 يعادل رمي عملة، و−1 خاطئ دائمًا.'
		}
	}
};

const presetTexts: Partial<Record<Lang, Record<string, PresetText>>> = {
	fr: {
		medical: {
			label: 'Dépistage médical',
			why: 'Rater un patient malade (un faux négatif) est bien pire qu’une fausse alerte qu’un examen de contrôle dissipera. Poussez le rappel vers le haut, même au prix de la précision.'
		},
		spam: {
			label: 'Filtre anti-spam',
			why: 'Envoyer un e-mail important dans les spams (un faux positif) est pire que de laisser passer un peu de spam. Gardez la précision proche de 100\u00a0%.'
		},
		balanced: {
			label: 'Jeu de données équilibré',
			why: 'Quand les deux classes sont fréquentes et que les deux erreurs coûtent à peu près autant, l’exactitude est un bon résumé et le F1 confirme que la classe positive est bien traitée.'
		},
		rare: {
			label: 'Piège de l’événement rare',
			why: 'Un modèle qui prédit toujours «\u00a0négatif\u00a0» obtient 99\u00a0% d’exactitude avec 1\u00a0% de fraude, sans rien détecter. Le rappel, le F1 et le MCC le démasquent immédiatement.'
		}
	},
	ar: {
		medical: {
			label: 'الفحص الطبي',
			why: 'تفويت مريض (سلبي كاذب) أسوأ بكثير من إنذار كاذب سيُبدّده فحص لاحق. ارفع الاستدعاء حتى لو كان ذلك على حساب الضبط.'
		},
		spam: {
			label: 'مرشّح البريد المزعج',
			why: 'إرسال رسالة مهمة إلى مجلد البريد المزعج (إيجابي كاذب) أسوأ من تمرير القليل من البريد المزعج. أبقِ الضبط قريبًا من 100%.'
		},
		balanced: {
			label: 'بيانات متوازنة',
			why: 'عندما تكون الفئتان شائعتين وتكون كلفة الخطأين متقاربة، تكون الدقة الإجمالية ملخصًا عادلًا ويؤكد F1 أن الفئة الموجبة تُعالَج جيدًا.'
		},
		rare: {
			label: 'فخ الحدث النادر',
			why: 'نموذج يتنبأ دائمًا بـ«سالب» يحقق دقة 99% عندما تكون نسبة الاحتيال 1%، لكنه لا يلتقط أي حالة. يكشفه الاستدعاء وF1 وMCC فورًا.'
		}
	}
};

/** Metric descriptions in the given language (formulas and keys stay as they are). */
export function metricInfoFor(lang: Lang): MetricInfo[] {
	const tr = metricTexts[lang];
	return tr ? metricInfo.map((m) => ({ ...m, ...tr[m.key] })) : metricInfo;
}

/** Scenario presets in the given language (counts and focus stay as they are). */
export function presetsFor(lang: Lang): Preset[] {
	const tr = presetTexts[lang];
	return tr ? presets.map((p) => ({ ...p, ...tr[p.id] })) : presets;
}
