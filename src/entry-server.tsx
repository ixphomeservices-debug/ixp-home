import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App, missingPage } from './App'
import { business } from './config/business'
import { pageData, serviceContent } from './config/content'
import { images } from './config/images'

export const origin = business.url
export const routes = Object.keys(pageData)
export function render(path: string) {
  const page = pageData[path] ?? missingPage
  const service = serviceContent.find(({ slug }) => path === '/services/' + slug)
  const photo = origin + (service?.photo.src ?? (path === '/' ? images.hero.src : images.inspection.src))
  return {
    html: renderToString(<StaticRouter location={path}><App /></StaticRouter>),
    title: page.title + ' | IXP Homes',
    description: page.description,
    photo,
    schema: {
      '@context': 'https://schema.org',
      '@type': service ? 'Service' : 'HomeAndConstructionBusiness',
      ...(service ? { name: service.title, serviceType: service.title, provider: { '@type': 'LocalBusiness', name: business.name, url: origin } }
        : { name: business.name, url: origin, image: photo, ...(business.phone ? { telephone: business.phone } : {}), ...(business.email ? { email: business.email } : {}) }),
      areaServed: business.areas.map((name) => ({ '@type': 'Place', name: name + ', Florida' }))
    }
  }
}
