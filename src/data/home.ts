import affiliateGlucose from "../assets/afilliate-banners/glucose-banner.png";
import affiliateLegacy from "../assets/afilliate-banners/legacy-banner.png";
import coverMakeine from "../assets/covers/makeine-cover.jpg";
import coverPajama from "../assets/covers/pajama-girl-cover.png";
import coverTottekawa from "../assets/covers/tottekawa-cover.png";

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
};

export type Series = {
	alt: string;
	title: string;
	cover: ImageMetadata;
}

// =================
// EXPORTS
// =================
export const chapters: Chapter[] = Array.from({ length: 6 }, () => ({
	series: "Too Many Losing Heroines",
	chapter: "Chapter 1",
	title: "I ate your mom out...",
}));

export const staff: StaffMember[] = [
	{ name: "rsa16", role: "the owner, probably", image: getStaffImage("rsa16") },
	{ name: "shion", role: "editor", image: getStaffImage("shion") },
	{ name: "CosmicRunner", role: "proofreader", image: getStaffImage("CosmicRunner") },
];

export const affiliates: Affiliate[] = [
	{ name: "Glucose Translations", image: affiliateGlucose },
	{ name: "LegacyEMTLs", image: affiliateLegacy },
];

export const series = [
	{ cover: coverMakeine, alt: "Too Many Losing Heroines cover", title: "Too Many Losing Heroines!" },
	{ cover: coverPajama, alt: "Alone in a Room with a Beautiful cover", title: "Alone in a Room with a Beautiful..." },
	{ cover: coverTottekawa, alt: "Date This Super Cute Me cover", title: "Date This Super Cute Me" },
];
