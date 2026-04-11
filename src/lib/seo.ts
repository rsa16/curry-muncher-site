export const SITE_NAME = 'Curry Muncher Translations';
export const DEFAULT_DESCRIPTION = 'Curry Muncher Translations publishes novel translations, latest chapter releases, volume pages, and support links.';

export function compactText(value?: string | null): string {
	return (value ?? '').replace(/\s+/g, ' ').trim();
}

export function truncateText(value: string, maxLength = 160): string {
	const compacted = compactText(value);
	if (compacted.length <= maxLength) return compacted;

	const sliced = compacted.slice(0, Math.max(0, maxLength - 3)).replace(/\s+\S*$/, '').trimEnd();
	return `${sliced}...`;
}

export function buildDescription(...parts: Array<string | null | undefined>): string {
	return truncateText(parts.map(compactText).filter(Boolean).join(' '));
}

export function buildPageTitle(title?: string): string {
	const compacted = compactText(title);
	if (!compacted) return SITE_NAME;
	if (compacted.includes(SITE_NAME)) return compacted;
	return `${compacted} | ${SITE_NAME}`;
}

export function getSiteUrl(): string {
	const rawValue =
		import.meta.env.PUBLIC_SITE_URL
		?? process.env.PUBLIC_SITE_URL
		?? process.env.SITE_URL
		?? process.env.VERCEL_URL
		?? process.env.CF_PAGES_URL
		?? process.env.URL;

	if (!rawValue) {
		return 'http://localhost:4321';
	}

	if (/^https?:\/\//i.test(rawValue)) {
		return rawValue.replace(/\/$/, '');
	}

	return `https://${rawValue.replace(/\/$/, '')}`;
}

export function resolveAbsoluteUrl(value?: string | null, siteUrl = getSiteUrl()): string | undefined {
	const compacted = compactText(value);
	if (!compacted) return undefined;

	try {
		return new URL(compacted, siteUrl).href;
	} catch {
		return undefined;
}
}