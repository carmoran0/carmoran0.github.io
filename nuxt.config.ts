export default defineNuxtConfig({
  devtools: { enabled: true },
  
  app: {
    baseURL: '/',
    head: {
      title: 'link(arlo)s',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/gif', href: '/images/77363yjcyzuk8gh.gif' },
        { rel: 'shortcut icon', type: 'image/gif', href: '/images/77363yjcyzuk8gh.gif' },
        { rel: 'apple-touch-icon', type: 'image/gif', href: '/images/77363yjcyzuk8gh.gif' },
        { rel: 'stylesheet', type: 'text/css', href: 'https://esm.sh/emfed@1/toots.css' }
      ],
      script: [
        { src: 'https://esm.sh/emfed@1', type: 'module' }
      ],
      style: [
        { children: '* {cursor: url(https://cur.cursors-4u.net/nature/nat-11/nat1027.ani), url(/images/nat1027.gif), auto !important;}' }
      ]
    }
  },

  css: [
    '~/assets/css/styles.css',
    '~/assets/css/weather.css'
  ],

  ssr: false,
  
  nitro: {
    preset: 'static',
    output: {
      publicDir: 'dist'
    }
  },

  generate: {
    fallback: '404.html'
  },

  compatibilityDate: '2024-10-24'
})
