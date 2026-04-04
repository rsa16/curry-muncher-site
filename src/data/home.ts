import staffOwner from "../assets/staff-pfps/owner.png";
import staffShion from "../assets/staff-pfps/shion.png";
import staffCosmic from "../assets/staff-pfps/cosmic.png";
import affiliateGlucose from "../assets/afilliate-banners/glucose-banner.png";
import affiliateLegacy from "../assets/afilliate-banners/legacy-banner.png";

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

export const chapters: Chapter[] = Array.from({ length: 6 }, () => ({
	series: "Too Many Losing Heroines",
	chapter: "Chapter 1",
	title: "I ate your mom out...",
}));

export const staff: StaffMember[] = [
	{ name: "rsa16", role: "the owner, probably", image: staffOwner },
	{ name: "shion", role: "editor", image: staffShion },
	{ name: "CosmicRunner", role: "proofreader", image: staffCosmic },
];

export const affiliates: Affiliate[] = [
	{ name: "Glucose Translations", image: affiliateGlucose },
	{ name: "LegacyEMTLs", image: affiliateLegacy },
];
