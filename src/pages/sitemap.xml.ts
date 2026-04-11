import { useStoryblokApi } from '@storyblok/astro';
import {
	buildChapterRoute,
	buildVolumeRoute,
	getNovelSlug,
	getVolumeSlug,
	toPublicChapterSlug,
	type ChapterStory,
	type NovelStory,
	type VolumeStory,
} from '@lib/storyblok-novels';
import { getSiteUrl } from '@lib/seo';

type SitemapEntry = {
	loc: string;
	lastmod?: string;
};

const staticPaths = [
	'/',
	'/about',
	'/contact-us',
	'/error-report',
	'/faq',
	'/novels',
	'/staff',
];

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function toAbsoluteUrl(pathname: string): string {
	return new URL(pathname, getSiteUrl()).href;
}

function formatDate(value?: string | null): string | undefined {
	if (!value) return undefined;
	const time = Date.parse(value);
	if (Number.isNaN(time)) return undefined;
	return new Date(time).toISOString();
}

export async function GET() {
	const storyblokApi = useStoryblokApi();
	const [novels, volumes, chapters] = await Promise.all([
		storyblokApi.getAll('cdn/stories', {
			content_type: 'Novel',
			starts_with: 'novels/',
			version: 'published',
			sort_by: 'first_published_at:desc'
		}) as Promise<NovelStory[]>,
		storyblokApi.getAll('cdn/stories', {
			content_type: 'Volume',
			starts_with: 'novels/',
			version: 'published',
			sort_by: 'content.sortOrder:asc'
		}) as Promise<VolumeStory[]>,
		storyblokApi.getAll('cdn/stories', {
			content_type: 'Chapter',
			starts_with: 'novels/',
			version: 'published',
			sort_by: 'content.chapterIndex:asc:int'
		}) as Promise<ChapterStory[]>,
	]);

	const entries: SitemapEntry[] = staticPaths.map((pathname) => ({
		loc: toAbsoluteUrl(pathname)
	}));

	for (const novel of novels) {
		entries.push({
			loc: toAbsoluteUrl(`/novels/${novel.slug}`),
			lastmod: formatDate(novel.updated_at ?? novel.published_at ?? novel.first_published_at),
		});
	}

	for (const volume of volumes) {
		const novelSlug = getNovelSlug(volume.full_slug);
		if (!novelSlug) continue;

		entries.push({
			loc: toAbsoluteUrl(buildVolumeRoute(novelSlug, volume.slug)),
			lastmod: formatDate(volume.updated_at ?? volume.published_at ?? volume.first_published_at),
		});
	}

	for (const chapter of chapters) {
		const novelSlug = getNovelSlug(chapter.full_slug);
		const volumeSlug = getVolumeSlug(chapter.full_slug);
		if (!novelSlug || !volumeSlug) continue;

		entries.push({
			loc: toAbsoluteUrl(buildChapterRoute(novelSlug, volumeSlug, toPublicChapterSlug(volumeSlug, chapter.slug))),
			lastmod: formatDate(chapter.updated_at ?? chapter.published_at ?? chapter.first_published_at),
		});
	}

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		entries.map((entry) => {
			const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
			return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n  </url>`;
		}).join('\n') +
		`\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		}
	});
}