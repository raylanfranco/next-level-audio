/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://nextlevelaudiopa.com',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/admin'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    ],
  },
};
