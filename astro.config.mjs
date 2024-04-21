import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: 'https://constitutia.florin.page',
  integrations: [starlight({
    title: "Constituția României",
    favicon: 'logo.png',
    head: [{
      tag: 'script',
      attrs: {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-4WBYC08DN1',
        defer: true
      }
    }, {
      tag: 'script',
      content: `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'G-4WBYC08DN1');`
    }],
    logo: {
      src: './public/images/logo2003.webp'
    },
    customCss: [
      // Relative path to your custom CSS file
      './src/styles/custom.css',
    ],
    defaultLocale: "root",
    locales: {
      root: {
        label: "Română",
        lang: "ro" // lang is required for root locales
      }
    },
    social: {
      github: "https://github.com/twentytwokhz/constitutie",
      rss: "https://florin.page",
      linkedin: "https://linkedin.com/in/florinbobis"
    },
    sidebar: [{
      label: "Constituția",
      items: [{
        label: "Istoric",
        link: "/constitutia/istoric"
      }, {
        label: "1952",
        link: "/constitutia/1952"
      }, {
        label: "1952➡️1986",
        link: "/1952-1986"
      }, {
        label: "1986",
        link: "/constitutia/1986"
      }, {
        label: "1986➡️1991",
        link: "/1986-1991"
      }, {
        label: "1991",
        link: "/constitutia/1991"
      }, {
        label: "1991➡️2003",
        link: "/1991-2003"
      }, {
        label: "2003",
        link: "/constitutia/2003",
        badge: { text: 'curentă', variant: 'tip' },
      }]
    }, {
      label: "Referințe",
      items: [{
        label: "CD 1991🔗",
        link: "https://www.cdep.ro/pls/dic/site2015.page?id=255",
        attrs: {
          target: '_blank'
        }
      }, {
        label: "CD 2003🔗",
        link: "https://www.cdep.ro/pls/dic/site2015.page?id=339",
        attrs: {
          target: '_blank'
        }
      }]
    }],
    lastUpdated: true,
    editLink: {
      baseUrl: 'https://github.com/twentytwokhz/constitutie/edit/master/'
    }
  }), react()]
});