import type { ServiceSlug } from './content'

type Rate = { label: string; low?: number; high?: number }
type Quantity = { label: string; max: number; example: string; minimum?: number }
export type QuotePlan = {
  summary: string
  note: string
  options: Rate[]
  quantity?: Quantity
  source?: { name: string; url: string }
}

const firstCoast = { name: 'First Coast Fix', url: 'https://firstcoastfix.com/pricing/' }
const gator = { name: 'Gator Carpet and Tile', url: 'https://carpetjax.com/price/' }
const handyman = { name: 'Ponte Vedra Handyman', url: 'https://www.pontevedra-handyman.com/blog/handyman-services-st-johns-fl' }

export const quotePlans: Partial<Record<ServiceSlug, QuotePlan>> = {
  'dryer-vent-cleaning': {
    summary: 'Starts at $177',
    note: 'The $177 starting price applies to one accessible dryer vent. Roof exits, difficult access, and additional vents need a scope review.',
    options: [{ label: 'One accessible dryer vent', low: 177 }, { label: 'Roof exit, difficult access, or multiple vents' }]
  },
  'pressure-washing': {
    summary: '$120–$200 for a driveway',
    note: 'Surface material, square footage, staining, water access, and setup can affect the final price.',
    options: [{ label: 'Standard driveway', low: 120, high: 200 }, { label: 'Exterior house wash', low: 250, high: 450 }, { label: 'Patio, deck, or multiple surfaces' }],
    source: firstCoast
  },
  'home-maintenance': {
    summary: '$75–$125 per hour',
    note: 'This is a labor budget. Materials and minimum visit charges may apply.',
    options: [{ label: 'Basic repairs, assembly, or a punch list', low: 75, high: 125 }],
    quantity: { label: 'Approximate labor hours', max: 24, example: '2' },
    source: handyman
  },
  'home-inspections': {
    summary: '$325–$435 up to 1,500 sq. ft.',
    note: 'Property age, layout, condition, and separate reports can affect the final estimate.',
    options: [
      { label: 'Up to 1,500 sq. ft.', low: 325, high: 435 },
      { label: '1,501–2,500 sq. ft.', low: 400, high: 510 },
      { label: '2,501–3,500 sq. ft.', low: 475, high: 610 },
      { label: 'Over 3,500 sq. ft. or specialty inspection' }
    ],
    source: { name: 'Mr. House Inspectors', url: 'https://www.mrhouseinspectors.com/pricing' }
  },
  'flooring-installation': {
    summary: '$8–$17 per sq. ft. for vinyl plank',
    note: 'Installed flooring budget. Stairs, demo, extensive subfloor work, and specialty finishes are reviewed separately.',
    options: [{ label: 'Luxury vinyl plank', low: 8, high: 17 }, { label: 'Hardwood, laminate, or other flooring' }],
    quantity: { label: 'Floor area (sq. ft.)', max: 10000, example: '250', minimum: 500 },
    source: gator
  },
  'tile-installation': {
    summary: '$8–$25 per sq. ft. for floor tile',
    note: 'Installed floor tile budget. Existing tile removal and major subfloor repair can change the cost.',
    options: [{ label: 'Standard floor tile', low: 8, high: 25 }, { label: 'Backsplash, shower, or custom tile' }],
    quantity: { label: 'Floor area (sq. ft.)', max: 5000, example: '150', minimum: 500 },
    source: gator
  },
  'interior-painting': {
    summary: '$350–$600 per standard room',
    note: 'Typical walls-only repaint. Ceiling work, trim, and extensive repairs need a separate review.',
    options: [{ label: 'Walls in standard rooms', low: 350, high: 600 }, { label: 'Ceilings, trim, or extensive preparation' }],
    quantity: { label: 'Number of rooms', max: 20, example: '2' },
    source: firstCoast
  },
  'drywall-repair': {
    summary: '$150–$300 for a typical patch',
    note: 'Wall texture, ceiling access, water damage, and repainting can affect the scope.',
    options: [{ label: 'One standard patch or small affected area', low: 150, high: 300 }, { label: 'Larger repair in one room', low: 300, high: 500 }, { label: 'Ceiling, moisture damage, or multiple rooms' }],
    source: firstCoast
  },
  'door-installation': {
    summary: '$200–$400 per interior door',
    note: 'Budget for standard interior installation. Door, hardware, and frame work may be additional.',
    options: [{ label: 'Standard interior door', low: 200, high: 400 }, { label: 'Exterior door or new opening' }],
    quantity: { label: 'Number of interior doors', max: 20, example: '1' },
    source: handyman
  },
  'tv-mounting': {
    summary: '$100–$175 for a standard mount',
    note: 'Bracket, wall material, screen size, and cable routing can affect the price.',
    options: [{ label: 'One standard TV on a suitable wall', low: 100, high: 175 }, { label: 'Large TV, masonry wall, or specialty mount' }],
    source: firstCoast
  },
  'trim-carpentry': {
    summary: '$3–$12 per linear ft.',
    note: 'Installed baseboard and trim budget. Profile, material, corners, and removal can affect the price.',
    options: [{ label: 'Baseboard or standard trim', low: 3, high: 12 }, { label: 'Crown molding or custom millwork' }],
    quantity: { label: 'Approximate linear feet', max: 2000, example: '60' },
    source: { name: 'Woodshop of Jacksonville', url: 'https://wsjacksonville.com/blog/custom-baseboards-trim-cost-jacksonville-fl-guide' }
  }
}

const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function quoteAmount(plan: QuotePlan, rate: Rate, quantity: number) {
  if (rate.low === undefined) return ''
  const minimum = plan.quantity?.minimum ?? 0
  const low = Math.max(minimum, rate.low * quantity)
  if (rate.high === undefined) return 'Starts at ' + dollars.format(low)
  const high = Math.max(minimum, rate.high * quantity)
  return low === high ? dollars.format(low) : dollars.format(low) + '–' + dollars.format(high)
}
