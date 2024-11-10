import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import storyblok from '@storyblok/astro';
const env = loadEnv("", process.cwd(), 'STORYBLOK');


// https://astro.build/config
export default defineConfig({
  integrations: [storyblok({
    accessToken: env.STORYBLOK_TOKEN,
    components: {
      novel: "storyblok/Novel",
      chapter: "storyblok/Chapter"
    },
    apiOptions: {
      region: "us"
    }
  })],
  vite: {
    plugins: [basicSsl()],
    server: {
      https: true
    }
  },
  image: {
    domains: ["storyblok.com"]
  }
});