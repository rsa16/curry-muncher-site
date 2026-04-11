import affiliateGlucose from "@assets/afilliate-banners/glucose-banner.png";
import affiliateGlucoseLogo from "@assets/afilliate-banners/glucose-logo.png";
import affiliateLegacy from "@assets/afilliate-banners/legacy-banner.png";
import affiliateLegacyLogo from "@assets/afilliate-banners/legacy-logo.svg";
import coverMakeine from "@assets/covers/makeine-cover.jpg";
import coverPajama from "@assets/covers/pajama-girl-cover.png";
import coverTottekawa from "@assets/covers/tottekawa-cover.png";
import faqMarkdown from "../content/faqs.md?raw";

// =================
// UTILS
// =================
const staffImages = import.meta.glob("../assets/staff-pfps/*.png", {
	eager: true,
	import: "default",
});

const getStaffImage = (name: string): ImageMetadata => {
	const entry = Object.entries(staffImages).find(([path]) => {
		const fileName = path.split("/").pop() ?? "";
		const baseName = fileName.replace(/\.png$/i, "");
		return baseName.toLowerCase() === name.toLowerCase();
	});

	if (!entry) {
		throw new Error(`Missing staff image for ${name}`);
	}

	return entry[1] as ImageMetadata;
};

const parseMarkdown = (text: string): string => {
	const applyInline = (str: string): string => {
		return str
			.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
			.replace(/\*(.+?)\*/g, "<em>$1</em>")
			.replace(/__(.*?)__/g, "<strong>$1</strong>")
			.replace(/_(.+?)_/g, "<em>$1</em>")
			.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-400 hover:underline">$1</a>');
	};

	return applyInline(text)
		.replace(/\n+/g, '<div style="margin-bottom: 1rem;"></div>')
};

const parseFaqMarkdown = (markdown: string): FAQ[] => {
	return markdown
		.split(/\r?\n(?=##\s+)/)
		.map((block) => block.trim())
		.filter((block) => block.startsWith("## "))
		.map((block) => {
			const lines = block.split(/\r?\n/);
			const question = lines[0].replace(/^##\s+/, "").trim();
			const answer = lines
				.slice(1)
				.map((line) => line.trim())
				.filter((line) => line.length > 0)
				.join("\n")
				.trim();

			return { question, answer: parseMarkdown(answer) };
		})
		.filter((faq) => faq.question.length > 0 && faq.answer.length > 0);
};

// =================
// TYPES
// =================
export type Chapter = {
	series: string;
	chapter: string;
	title: string;
};

export type StaffMember = {
	name: string;
	role: string;
	image: ImageMetadata;
};

export type Affiliate = {
	name: string;
	image: ImageMetadata;
	url: string;
	logo?: ImageMetadata;
};

export type Series = {
	alt: string;
	title: string;
	cover: ImageMetadata | string;
	href: string;
}

export type FAQ = {
	question: string;
	answer: string;
};

// =================
// EXPORTS
// =================
export const chapters: Chapter[] = Array.from({ length: 6 }, () => ({
	series: "Too Many Losing Heroines",
	chapter: "Chapter 1",
	title: "I ate your mom out...",
}));

export const staff: StaffMember[] = [
	{ name: "rsa", role: "the owner, probably", image: getStaffImage("rsa16") },
	{ name: "shion", role: "editor", image: getStaffImage("shion") },
	{ name: "Vranesh", role: "proofreader", image: getStaffImage("Vranesh")},
	{ name: "CosmicRunner", role: "proofreader", image: getStaffImage("CosmicRunner") },
	{ name: "air koi", role: "emotional support", image: getStaffImage("airkoi")},
];

export const affiliates: Affiliate[] = [
	{ name: "Glucose Translations", image: affiliateGlucose, url: "https://glucosetl.xyz", logo: affiliateGlucoseLogo },
	{ name: "LegacyEMTLs", image: affiliateLegacy, url: "https://www.legacyemtls.com/", logo: affiliateLegacyLogo },
];

export const series = [
	{ cover: coverMakeine, alt: "Too Many Losing Heroines cover", title: "Too Many Losing Heroines!", href: "/novels/too-many-losing-heroines" },
	{ cover: coverPajama, alt: "Alone in a Room with a Beautiful cover", title: "Alone in a Room with a Beautiful...", href: "/novels/alone-in-a-room-with-a-beautiful" },
	{ cover: coverTottekawa, alt: "Date This Super Cute Me cover", title: "Date This Super Cute Me", href: "/novels/date-this-super-cute-me" },
];

export const faqs: FAQ[] = parseFaqMarkdown(faqMarkdown);

export const discordUrl = "https://discord.com/invite/SzfCeGfMN6"