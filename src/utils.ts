export const categorize = (array: any[], fn: (arg: any) => any) =>
	array.reduce(
		(r, v, _i, _a, k = fn(v)) => ((r[k] || (r[k] = [])).push(v), r),
		{},
	);

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export function excerpt(content: string, query: string) {
	const escape = (text: string) =>
		text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

	const index = content.toLowerCase().indexOf(query.toLowerCase());

	if (index === -1) {
		return null;
	}

	const prefix =
		index > 20
			? `…${content.slice(index - 15, index)}`
			: content.slice(0, index);

	const suffixEnd =
		index + query.length + (80 - (prefix.length + query.length));
	let suffix =
		content.slice(index + query.length, suffixEnd) +
		(suffixEnd < content.length ? "…" : "");

	const highlighted = escape(content.slice(index, index + query.length));

	if (highlighted.length > 0) {
		return (
			escape(prefix) +
			(highlighted ? `<mark>${highlighted}</mark>` : "") +
			escape(suffix)
		);
	} else {
		return null;
	}
}

export function debounce<T extends (...args: any[]) => void>(
	callback: T,
	wait = 50,
): (...args: unknown[]) => void {
	let timer: ReturnType<typeof setTimeout>;
	return (...args: unknown[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => callback(...args), wait);
	};
}