import { getSiteUrl } from '@lib/seo';

export async function GET() {
	const sitemapUrl = new URL('/sitemap.xml', getSiteUrl()).href;
	const body = `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		}
	});
}