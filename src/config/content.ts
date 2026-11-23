import { images, type Photo } from './images'
import { services } from '../../shared/lead.mjs'

export type ServiceSlug = Exclude<keyof typeof services, 'other'>
export const serviceGroups = ['Repair & maintenance', 'Installations & improvements', 'Inspections & property care'] as const

type Service = {
  slug: ServiceSlug
  group: (typeof serviceGroups)[number]
  title: string
  cardDescription: string
  description: string
  seo: string
  intro: string
  details: string[]
  note: string
  photo: Photo
}
export const serviceContent: Service[] = [
  {
    slug: 'home-inspections', group: 'Inspections & property care', title: 'Home Inspections',
    cardDescription: 'Know the home’s condition before buying, selling, or repairing.',
    description: 'Get a clearer picture of a home’s condition before you buy, list it, or decide which repairs to tackle.',
    seo: 'Jacksonville Home Inspections',
    intro: 'A residential inspection looks at visible, accessible parts of the home. Share any concerns up front so we can discuss the areas to focus on and the information you need for your next decision.',
    details: ['Residential home inspections', 'Pre-purchase and pre-listing inspections', 'General home condition assessments', 'Luxury residential property inspections'],
    note: 'Share the property type, transaction timeline, and any areas you would like to discuss when you request an estimate.',
    photo: images.inspection
  },
  {
    slug: 'pressure-washing', group: 'Repair & maintenance', title: 'Pressure Washing',
    cardDescription: 'Clear grime and algae from driveways, pavers, and patios.',
    description: 'Wash away surface grime and algae from driveways, patios, pavers, and walkways with an approach suited to the material.',
    seo: 'Pressure Washing in Jacksonville, FL',
    intro: 'Concrete, pavers, and painted surfaces need different cleaning approaches. We’ll ask about the material, the type of buildup, and access to water before recommending how to clean the area.',
    details: ['Driveway and paver cleaning', 'Patio, sidewalk, and walkway cleaning', 'Exterior surface cleaning', 'Soft washing where appropriate'],
    note: 'Let us know which surfaces need attention and whether they are sealed, painted, or otherwise sensitive.',
    photo: images.washing
  },
  {
    slug: 'dryer-vent-cleaning', group: 'Repair & maintenance', title: 'Dryer Vent Cleaning',
    cardDescription: 'Clear lint from accessible ducting and the outside vent.',
    description: 'Remove lint from accessible dryer exhaust ducting and the outside vent so air has a clear path out.',
    seo: 'Dryer Vent Cleaning in Jacksonville, FL',
    intro: 'If loads take longer to dry or lint collects at the exterior vent, cleaning the exhaust may help. The scope depends on where the vent exits, how the duct runs, and how easily it can be reached.',
    details: ['Residential dryer exhaust vent cleaning', 'Removal of lint and buildup from accessible ducting', 'Clearing debris around the exterior vent opening'],
    note: 'When requesting an estimate, let us know if the dryer is upstairs, in a tight closet, or connected to a roof vent.',
    photo: images.dryerVent
  },
  {
    slug: 'home-maintenance', group: 'Repair & maintenance', title: 'Handyman & Home Maintenance',
    cardDescription: 'Tackle minor repairs, assembly, and routine upkeep.',
    description: 'Work through your household to-do list, from minor repairs and furniture assembly to seasonal upkeep.',
    seo: 'Property Maintenance in Jacksonville',
    intro: 'Send us the jobs you’ve been putting off, whether it’s one repair or a list spanning several rooms. We’ll help you prioritize the work and identify what can be handled in the same visit.',
    details: ['Minor household repairs', 'Furniture assembly and basic installations', 'Preventive home maintenance', 'Interior and exterior punch lists'],
    note: 'Have several items on your list? Include them together so we can discuss scope and scheduling in one conversation.',
    photo: images.maintenance
  },
  {
    slug: 'luxury-property-care', group: 'Inspections & property care', title: 'Luxury Property Care',
    cardDescription: 'Plan inspections and care for waterfront and specialty homes.',
    description: 'Coordinate inspections, exterior cleaning, and seasonal upkeep for waterfront homes and properties with specialty finishes.',
    seo: 'Luxury Property Care in Ponte Vedra Beach',
    intro: 'Salt air, shaded patios, and specialty materials can all affect how a home needs to be maintained. We plan around the surfaces, access, and priorities of your property.',
    details: ['Luxury residential property inspections', 'Cleaning for outdoor living areas', 'Preventive and seasonal maintenance planning'],
    note: 'Tell us about any access requirements, sensitive surfaces, or scheduling preferences when you request an estimate.',
    photo: images.hero
  },
  {
    slug: 'flooring-installation', group: 'Installations & improvements', title: 'Flooring Installation',
    cardDescription: 'Install hardwood, laminate, or luxury vinyl plank.',
    description: 'Install hardwood, laminate, or luxury vinyl plank with clean transitions between rooms, hallways, and doorways.',
    seo: 'Flooring Installation in Jacksonville, FL',
    intro: 'New flooring starts below the surface. We’ll discuss the condition of the existing floor, how the material will be laid, and how the edges and transitions will meet adjacent rooms.',
    details: ['Luxury vinyl plank and laminate', 'Hardwood flooring installation', 'Room-to-room transitions and finishing'],
    note: 'Tell us whether you already have the flooring and whether the old floor needs to come out.',
    photo: images.flooring
  },
  {
    slug: 'tile-installation', group: 'Installations & improvements', title: 'Tile Installation',
    cardDescription: 'Set ceramic or porcelain tile on floors, walls, and backsplashes.',
    description: 'Install porcelain or ceramic tile on floors, backsplashes, and bathroom walls, with attention to layout and grout lines.',
    seo: 'Tile Installation in Jacksonville, FL',
    intro: 'The tile pattern affects how cuts fall at corners, outlets, and edges. We’ll talk through the layout and finish, and review surface preparation when the project involves a shower or other wet area.',
    details: ['Ceramic and porcelain floors', 'Kitchen backsplashes', 'Bathroom and shower tile'],
    note: 'Let us know about existing tile, unusual cuts, or wet-area waterproofing needs.',
    photo: images.tile
  },
  {
    slug: 'interior-painting', group: 'Installations & improvements', title: 'Interior Painting',
    cardDescription: 'Refresh walls, ceilings, doors, and trim.',
    description: 'Refresh a room or several living areas with walls, ceilings, doors, and trim painted to suit the space.',
    seo: 'Interior Painting in Jacksonville, FL',
    intro: 'Preparation shapes the final finish. We’ll confirm which surfaces need paint, whether minor repairs are needed, and the color and sheen you want for each area.',
    details: ['Walls and ceilings', 'Interior trim and doors', 'Minor surface preparation and touch-ups'],
    note: 'Include the room count, ceiling height, and any major color changes or wall damage.',
    photo: images.painting
  },
  {
    slug: 'landscaping-projects', group: 'Installations & improvements', title: 'Landscaping Projects',
    cardDescription: 'Refresh garden beds with new planting, mulch, and edging.',
    description: 'Update your entry or outdoor space with a one-time landscaping project, from planting and mulch to defined bed edges.',
    seo: 'Landscaping Projects in Jacksonville, FL',
    intro: 'Tell us what you want to change about the space. We’ll discuss the existing plants, sunlight, access, and materials so the estimate fits your garden beds and the look you want.',
    details: ['Garden bed installations and refreshes', 'Shrub and ornamental planting', 'Mulch and landscape bed edging'],
    note: 'Share approximate bed dimensions and list any plants or materials you want to keep.',
    photo: images.landscaping
  },
  {
    slug: 'drywall-repair', group: 'Repair & maintenance', title: 'Drywall Repair',
    cardDescription: 'Patch damaged walls and blend the surrounding texture.',
    description: 'Patch holes, dents, and damaged drywall, then blend the repair with the surrounding texture for a paint-ready finish.',
    seo: 'Drywall Repair in Jacksonville, FL',
    intro: 'A small wall patch and a damaged ceiling call for different preparation. Photos and rough dimensions help us assess the repair, including how to match the existing texture.',
    details: ['Holes, dents, and minor cracks', 'Localized drywall patching', 'Texture matching and paint-ready finishes'],
    note: 'Tell us if the damage is on a ceiling or linked to a leak so we can discuss the right next step.',
    photo: images.drywall
  },
  {
    slug: 'door-installation', group: 'Installations & improvements', title: 'Door Installation',
    cardDescription: 'Fit replacement doors and check the frame, swing, and hardware.',
    description: 'Replace interior or exterior doors with attention to the fit of the frame, the swing, and how the hardware operates.',
    seo: 'Door Installation in Jacksonville, FL',
    intro: 'A sound frame may only need a replacement door, while a worn jamb may need more work. We’ll review the opening, hardware, and access before confirming the installation scope.',
    details: ['Interior door replacements', 'Exterior door inquiries', 'Door hardware and finishing'],
    note: 'If you already have a new door, include its size and whether it is prehung.',
    photo: images.door
  },
  {
    slug: 'tv-mounting', group: 'Installations & improvements', title: 'TV Mounting',
    cardDescription: 'Mount your TV at a comfortable height with the right bracket.',
    description: 'Mount your TV at a comfortable viewing height with a bracket suited to the screen and wall.',
    seo: 'TV Mounting in Jacksonville, FL',
    intro: 'We’ll talk through where you sit, what the wall is made of, and whether you want the screen fixed, tilted, or able to swivel. Outlet location and cable routing can affect the placement.',
    details: ['Fixed, tilt, and articulating mount inquiries', 'Mounting on suitable walls', 'Placement and everyday cable organization'],
    note: 'Include your TV size and whether you already have a compatible mounting bracket.',
    photo: images.tv
  },
  {
    slug: 'trim-carpentry', group: 'Installations & improvements', title: 'Trim Carpentry',
    cardDescription: 'Finish rooms with baseboards, crown molding, and casing.',
    description: 'Finish a room with fitted baseboards, crown molding, or door and window casing that suits the rest of your home.',
    seo: 'Trim Carpentry in Jacksonville, FL',
    intro: 'The profile, material, and number of corners affect the fit and finish. Share a rough measurement and a photo of any trim you want to match so we can review the options.',
    details: ['Baseboard installation', 'Crown molding and finish trim', 'Interior door and window casing'],
    note: 'Let us know if old trim needs removal and whether you want primed or finished material.',
    photo: images.trim
  }
]

export const pageData: Record<string, { title: string; description: string }> = {
  '/': { title: 'Jacksonville Home Services, Repairs & Landscaping', description: 'Explore Jacksonville home services from IXP Homes, including inspections, repairs, installations, landscaping projects, and property maintenance.' },
  '/services': { title: 'Home Services in Jacksonville, FL', description: 'Explore flooring, tile, painting, landscaping projects, handyman repairs, inspections, and cleaning services in Northeast Florida.' },
  '/instant-quote': { title: 'Instant Home Service Quote', description: 'Get a quick planning estimate for home repairs, installations, cleaning, and more in the Jacksonville area.' },
  '/about': { title: 'About IXP Homes', description: 'Learn how IXP Homes approaches home inspections and property upkeep for Jacksonville-area homeowners.' },
  '/service-areas': { title: 'Service Areas in Northeast Florida', description: 'Request property services in Jacksonville, Ponte Vedra Beach, the Jacksonville beaches, Nocatee, St. Johns, and Amelia Island.' },
  '/contact': { title: 'Contact IXP Homes', description: 'Contact IXP Homes about home repairs, installations, landscaping projects, cleaning, or inspections in Northeast Florida.' },
  '/estimate': { title: 'Request a Free Service Estimate', description: 'Tell IXP Homes about your Jacksonville-area property and request a no-obligation service estimate.' },
  '/privacy': { title: 'Privacy Policy', description: 'How IXP Homes handles information submitted through our website.' },
  '/terms': { title: 'Terms of Use', description: 'Terms for using the IXP Homes website and requesting services.' }
}
for (const service of serviceContent) {
  pageData['/services/' + service.slug] = { title: service.seo, description: service.description }
}
