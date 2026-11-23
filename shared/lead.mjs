export const services = {
  'home-inspections': 'Home Inspections',
  'pressure-washing': 'Pressure Washing',
  'dryer-vent-cleaning': 'Dryer Vent Cleaning',
  'home-maintenance': 'Handyman & Home Maintenance',
  'luxury-property-care': 'Luxury Property Care',
  'flooring-installation': 'Flooring Installation',
  'tile-installation': 'Tile Installation',
  'interior-painting': 'Interior Painting',
  'landscaping-projects': 'Landscaping Projects',
  'drywall-repair': 'Drywall Repair',
  'door-installation': 'Door Installation',
  'tv-mounting': 'TV Mounting',
  'trim-carpentry': 'Trim Carpentry',
  other: 'Help Choosing a Service'
}
export const propertyTypes = ['Single-family home', 'Townhome', 'Condo', 'Other']
export const timeframes = ['As soon as possible', 'Within 2 weeks', 'Within a month', 'Flexible']
export const consentVersion = 'contact-v1'
export const emptyLead = {
  service: '', propertyAddress: '', zip: '', propertyType: '', squareFeet: '',
  details: '', timeframe: '', additional: [], firstName: '', lastName: '',
  email: '', phone: '', contactMethod: 'email', consent: false, website: ''
}
const limits = {
  service: 40, propertyAddress: 180, zip: 5, propertyType: 40, squareFeet: 7,
  details: 2000, timeframe: 40, firstName: 70, lastName: 70, email: 254,
  phone: 30, contactMethod: 12, website: 180, source: 16,
  utmSource: 80, utmMedium: 80, utmCampaign: 80, referrer: 120
}
export const emailValid = (value) => /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(value)
const isService = (value) => typeof value === 'string' && Object.hasOwn(services, value)
export function validateLead(input, { sourceRequired = true } = {}) {
  /** @type {Record<string, string>} */
  const errors = {}
  const data = {}
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { data, errors: { form: 'Invalid request.' } }
  for (const [field, limit] of Object.entries(limits)) {
    const value = input[field] ?? ''
    if (typeof value !== 'string' || value.length > limit ||
        // oxlint-disable-next-line no-control-regex -- Reject control characters before delivery.
        (field === 'details' ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(value)) {
      errors[field] = 'This value contains unsupported characters or is too long.'
      data[field] = ''
      continue
    }
    data[field] = value.trim()
  }
  if (!isService(data.service)) errors.service ??= 'Choose a service.'
  if (data.propertyAddress.length < 3) errors.propertyAddress ??= 'Enter the property location.'
  if (!/^\d{5}$/.test(data.zip)) errors.zip ??= 'Enter a five-digit ZIP code.'
  if (!propertyTypes.includes(data.propertyType)) errors.propertyType ??= 'Choose a property type.'
  if (data.squareFeet && !/^[1-9]\d{0,6}$/.test(data.squareFeet)) errors.squareFeet ??= 'Enter a positive whole number.'
  if (data.details.length < 10) errors.details ??= 'Enter at least 10 characters about your project.'
  if (!timeframes.includes(data.timeframe)) errors.timeframe ??= 'Choose a timeframe.'
  if (!data.firstName) errors.firstName ??= 'Enter your first name.'
  if (!data.lastName) errors.lastName ??= 'Enter your last name.'
  if (!emailValid(data.email)) errors.email ??= 'Enter a valid email address.'
  if (!['email', 'phone'].includes(data.contactMethod)) errors.contactMethod ??= 'Choose a contact method.'
  if (data.phone || data.contactMethod === 'phone' || data.source === 'estimate') {
    const digits = data.phone.replace(/\D/g, '')
    if (!/^\+?[0-9(). -]+$/.test(data.phone) || digits.length < 10 || digits.length > 15) errors.phone ??= 'Enter a valid phone number.'
  }
  if (input.consent !== true) errors.consent = 'Confirm that IXP Homes may contact you about your request.'
  data.consent = input.consent === true
  data.consentVersion = consentVersion
  if (sourceRequired && !['estimate', 'chat', 'contact'].includes(data.source)) errors.source ??= 'Invalid lead source.'
  const additional = input.additional ?? []
  data.additional = []
  if (!Array.isArray(additional) || additional.length > Object.keys(services).length - 1 || additional.some((value) => !isService(value) || value === 'other')) {
    errors.additional = 'Choose valid additional services.'
  } else {
    data.additional = [...new Set(additional)].filter((value) => value !== data.service)
  }
  if (data.website) errors.website = 'Invalid request.'
  return { data, errors }
}
