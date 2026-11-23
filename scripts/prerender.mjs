import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { render, routes, origin } from '../dist-ssr/entry-server.js'

const template = await readFile('dist/index.html', 'utf8')
const escape = (input) => input.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

for (const path of [...routes, '/404']) {
  const page = render(path)
  const url = origin + (path === '/' ? '/' : path)
  const indexable = path !== '/404'
  const metadata = [
    '<title>' + escape(page.title) + '</title>',
    '<meta name="description" content="' + escape(page.description) + '">',
    '<meta name="robots" content="' + (indexable ? 'index' : 'noindex') + ', follow">',
    indexable && '<link rel="canonical" href="' + escape(url) + '">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="IXP Homes">',
    '<meta property="og:title" content="' + escape(page.title) + '">',
    '<meta property="og:description" content="' + escape(page.description) + '">',
    '<meta property="og:url" content="' + escape(url) + '">',
    '<meta property="og:image" content="' + escape(page.photo) + '">',
    indexable && '<script type="application/ld+json">' + JSON.stringify(page.schema).replace(/</g, '\\u003c') + '</script>'
  ].filter(Boolean).join('\n    ')
  const file = path === '/404' ? 'dist/404.html' : resolve('dist', '.' + path, 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, template.replace('<!--page-meta-->', () => metadata).replace('<!--page-html-->', () => page.html))
}

await writeFile('dist/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  routes.map((path) => '\n  <url><loc>' + escape(origin + path) + '</loc></url>').join('') + '\n</urlset>\n')
await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + origin + '/sitemap.xml\n')
console.log('Prerendered ' + routes.length + ' site routes and a 404 page.')
