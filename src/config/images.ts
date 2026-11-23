export type Photo = { src: string; small?: string; alt: string; caption?: string }

function photo(path: string, alt: string): Photo {
  return { src: '/images/' + path + '.webp', small: '/images/' + path + '-sm.webp', alt }
}

export const images = {
  hero: photo('hero/waterfront', 'Coastal waterfront residence with illuminated windows reflected in the water at dusk'),
  inspection: photo('home-inspections/inspection', 'A home inspector evaluating a window with a tablet'),
  washing: photo('pressure-washing/pavers', 'A pressure washing wand rinsing a herringbone paver driveway'),
  dryerVent: photo('dryer-vent-cleaning/exterior-vent', 'A technician cleaning an exterior dryer exhaust vent'),
  maintenance: photo('maintenance/entry', 'Landscaped front entry of a coastal Florida home'),
  flooring: photo('home-services/flooring', 'A flooring installer fitting light oak boards'),
  tile: photo('home-services/tile', 'An installer setting large-format porcelain floor tile'),
  painting: photo('home-services/painting', 'A painter rolling paint onto an interior wall'),
  landscaping: photo('home-services/landscaping', 'A worker planting a shrub in a mulched bed beside a paver walkway'),
  drywall: photo('home-services/drywall', 'A technician smoothing a drywall patch'),
  door: photo('home-services/door', 'A technician aligning a new interior door'),
  tv: photo('home-services/tv', 'A technician fitting a television to a living room wall mount'),
  trim: photo('home-services/trim', 'A carpenter fitting baseboard trim at a room corner'),
  before: photo('gallery/before', 'Illustrative walkway with visible staining on the pavers'),
  after: photo('gallery/after', 'Illustrative walkway showing clean pavers'),
  demoCaption: 'Illustrative imagery. Business project photos will be added when available.'
}
