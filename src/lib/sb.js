import StoryblokClient from 'storyblok-js-client';

export const sb = new StoryblokClient({
	accessToken: import.meta.env.STORYBLOK_TOKEN
});

export const defaultConfig = {
	version:
		import.meta.env.STORYBLOK_VERSION === 'draft' || import.meta.env.DEV
			? 'draft'
			: 'published'
};