import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: 'https://stargazers.club',
  integrations: [
    starlight({
      title: "Constituția României",
      favicon: './src/assets/constitutia-romaniei-stema-2003.png',
      logo: {
        src: './src/assets/constitutia-romaniei-stema-2003.png',
      },
      // customCss: [
      //   // Relative path to your custom CSS file
      //   './src/styles/custom.css',
      // ],
      defaultLocale: "root",
      locales: {
        root: {
          label: "Română",
          lang: "ro", // lang is required for root locales
        },
      },
      social: {
        github: "https://github.com/twentytwokhz/constitutia",
        rss: "https://florin.page",
        linkedin: "https://linkedin.com/in/florinbobis"
      },
      sidebar: [
        {
          label: "Constituția",
          items: [
            { label: "Istoric", link: "/constitutia/istoric" },
            { label: "1991", link: "/constitutia/1991" },
            { label: "2003", link: "/constitutia/2003" },
          ],
        },
        {
          label: "Referințe",
          items: [
            { label: "CD 1991🔗", link: "https://www.cdep.ro/pls/dic/site2015.page?id=255", attrs: { target: '_blank' } },
            { label: "CD 2003🔗", link: "https://www.cdep.ro/pls/dic/site2015.page?id=339", attrs: { target: '_blank' } },
          ],
        },
      ],
    }),
  ],
});
