import type { ISbStoryData, SbBlokData } from '@storyblok/astro';

export interface StoryblokRichText {
	type?: string;
	content?: StoryblokRichText[];
	text?: string;
	attrs?: Record<string, unknown>;
	[key: string]: unknown;
}

export type StoryblokStatus = 'ongoing' | 'completed' | 'retranslating' | 'translating';

// Storyblok link field shapes used by Novel and Volume fields.
export interface StoryblokLinkField {
	linktype?: 'asset' | 'email' | 'story' | 'url';
	url?: string;
	cached_url?: string;
	story?: {
		url?: string;
	};
	email?: string;
}

// Asset fields expose the file URL and optional metadata from Storyblok.
export interface StoryblokAsset {
	filename?: string | null;
	alt?: string | null;
	title?: string | null;
}

// Novel root entry data from the new schema.
export interface NovelContent {
	component: 'Novel';
	name: string;
	author: string;
	illustrator: string;
	bannerImage?: StoryblokAsset | null;
	coverImage?: StoryblokAsset | null;
	synopsis: string;
	status: StoryblokStatus;
	raws?: StoryblokLinkField | null;
	novelupdates?: StoryblokLinkField | null;
	epubs?: StoryblokLinkField | null;
}

// Nested download block used inside Volume.downloads.
export interface VolumeDownloadBlock {
	_uid?: string;
	component: 'download_nestable';
	label: string;
	link?: StoryblokLinkField | null;
}

export interface VolumeChangelogEntryBlock {
	_uid?: string;
	component?: string;
	version: string;
	date?: string | null;
	shortTitle: string;
	description?: string | null;
}

// Volume entry data from /novels/:novel/volumes/:volume.
export interface VolumeContent {
	component: 'Volume';
	displayName: string;
	volumeNumber: number;
	sortOrder: number;
	series?: string | null;
	rawLink?: StoryblokLinkField | null;
	officialLink?: StoryblokLinkField | null;
	coverImage?: StoryblokAsset | null;
	illustrations?: StoryblokAsset[] | null;
	synopsis: StoryblokRichText;
	credits?: StoryblokRichText | null;
	changelog?: VolumeChangelogEntryBlock[] | null;
	downloads?: VolumeDownloadBlock[] | null;
}

// Chapter entry data from /novels/:novel/volumes/:volume/chapters/:chapter.
export interface ChapterContent {
	component: 'Chapter';
	chapterTitle: string;
	displayName: string;
	series?: string | null;
	volume?: string | null;
	postDate: string;
	volumeNumber?: number | null;
	chapterIndex: number;
	content: StoryblokRichText;
}

export type NovelStory = ISbStoryData<NovelContent>;
export type VolumeStory = ISbStoryData<VolumeContent>;
export type ChapterStory = ISbStoryData<ChapterContent>;

// Bridge strongly typed content objects to Storyblok's editable helper type.
export function asEditableBlok<T>(blok: T): SbBlokData {
	return blok as unknown as SbBlokData;
}

export interface NovelVolumeCardData {
	label: string;
	href: string;
	image?: string;
	lastUpdate: string;
	chapterCount: number;
}

export interface VolumeChapterLink {
	name: string;
	slug: string;
	href: string;
	chapterIndex: number;
	postDate?: string;
}

export interface VolumePageChapterGroup {
	label: string;
	href: string;
	chapters: VolumeChapterLink[];
}

// Convert a Storyblok full_slug into the novel slug segment.
export function getNovelSlug(fullSlug: string): string {
	return fullSlug.split('/')[1] ?? '';
}

// Convert a Storyblok full_slug into the volume slug segment.
export function getVolumeSlug(fullSlug: string): string {
	const segments = fullSlug.split('/');
	return segments[3] ?? '';
}

// Convert a Storyblok full_slug into the chapter slug segment.
export function getChapterSlug(fullSlug: string): string {
	const segments = fullSlug.split('/');
	return segments[segments.length - 1] ?? '';
}

// Remove duplicated volume prefixes from chapter slugs for cleaner URLs.
export function toPublicChapterSlug(volumeSlug: string, chapterSlug: string): string {
	const prefix = `${volumeSlug}-`;
	return chapterSlug.startsWith(prefix) ? chapterSlug.slice(prefix.length) : chapterSlug;
}

// Build the public route for a volume page.
export function buildVolumeRoute(novelSlug: string, volumeSlug: string): string {
	return `/novels/${novelSlug}/${volumeSlug}`;
}

// Build the public route for a chapter page.
export function buildChapterRoute(novelSlug: string, volumeSlug: string, chapterSlug: string): string {
	return `/novels/${novelSlug}/${volumeSlug}/${toPublicChapterSlug(volumeSlug, chapterSlug)}`;
}

// Resolve a Storyblok link field to a usable href.
export function resolveStoryblokLink(link?: StoryblokLinkField | null): string | undefined {
	if (!link) return undefined;

	if (link.linktype === 'email' && link.email) {
		return `mailto:${link.email}`;
	}

	if (typeof link.url === 'string' && link.url.length > 0) {
		return link.url;
	}

	if (typeof link.story?.url === 'string' && link.story.url.length > 0) {
		return `/${link.story.url.replace(/^\/+/, '')}`;
	}

	if (typeof link.cached_url === 'string' && link.cached_url.length > 0) {
		if (link.linktype === 'story') {
			return `/${link.cached_url.replace(/^\/+/, '')}`;
		}

		return link.cached_url;
	}

	return undefined;
}

// Resolve a Storyblok asset field to a direct image URL.
export function resolveStoryblokAsset(asset?: StoryblokAsset | null): string | undefined {
	return asset?.filename || undefined;
}

// Extract readable paragraph text from a Storyblok rich text block.
export function extractRichTextParagraphs(value?: StoryblokRichText | null): string[] {
	if (!value?.content?.length) return [];

	const paragraphs: string[] = [];

	const readText = (node: StoryblokRichText): string => {
		if (typeof node.text === 'string') return node.text;
		if (Array.isArray(node.content)) return node.content.map(readText).join('');
		return '';
	};

	const walk = (nodes?: StoryblokRichText[]) => {
		nodes?.forEach((node) => {
			if (node.type === 'paragraph') {
				const text = readText(node).trim();
				if (text) paragraphs.push(text);
				return;
			}

			if (node.content?.length) {
				walk(node.content);
			}
		});
	};

	walk(value.content);

	return paragraphs;
}

// Render dates for compact UI summaries.
export function formatShortDate(value?: string): string {
	if (!value) return 'Unknown';

	const parsed = Date.parse(value);
	if (Number.isNaN(parsed)) return 'Unknown';

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: '2-digit'
	}).format(parsed);
}

// Render dates for chapter pages and other detailed views.
export function formatLongDate(value?: string): string {
	if (!value) return 'Unknown';

	const parsed = Date.parse(value);
	if (Number.isNaN(parsed)) return 'Unknown';

	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	}).format(parsed);
}
