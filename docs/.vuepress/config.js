module.exports = {
  base: '/app/',
  // NOTE: Most of this config must be the same as the one in the app repo to make sure
  //   it's consistent when navigating between the two.
  title: 'Directus',
  description: 'A headless CMS that manages your content, not your workflow.',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'User Guide', link: '/user-guide/' },
      { text: 'Developer Guide', link: '/developer-guide/' },
      { text: 'Contributors Guide', link: '/contributors-guide/' },
    ],
    repo: 'directus/app',
    docsDir: 'docs',
    editLinks: true,
    sidebar: {
      '/user-guide/': [
        '',
      ],

      '/developer-guide/': [
        '',
      ],

      '/contributors-guide/': [
        '',
        'working-with-github',
        'setting-up-local-dev-env',
        'translations-and-title-format',
        'using-the-api'
      ],

      // fallback
      '/': [
        '',
        'user-guide',
        'developer-guide',
        'contributors-guide',
      ]
    }
  }
};
