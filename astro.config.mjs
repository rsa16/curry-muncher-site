// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

const env = loadEnv("", process.cwd(), 'STORYBLOK');

// https://astro.build/config
export default defineConfig({
  integrations: [
    icon(),
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      components: {
        novel: "components/novels/Novel",
        volume: "components/novels/Volume",
        chapter: "components/novels/Chapter",
        download_nestable: "components/novels/DownloadNestable"
      },
      apiOptions: {
        region: 'us',
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
      allowedHosts: [
        '.loca.lt'
      ]
    }
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Instrument Serif",
      cssVariable: "--font-instrument",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Poppins",
      cssVariable: "--font-poppins",
      weights: [300, 400, 500, 600, 700]
    },
    {
      provider: fontProviders.fontsource(),
      name: "Merriweather",
      cssVariable: "--font-merriweather"
    }
  ],
  image: {
    remotePatterns: [{
      protocol: "https",
      hostname: "*.storyblok.com",
      pathname: "/**"
    }]
  }
});