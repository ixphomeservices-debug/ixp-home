import { services, propertyTypes, timeframes, validateLead } from './lead.mjs'

export const chatGreeting = 'Welcome to IXP Homes! What can we help with today? Choose a service or type its name.'
export const chatSteps = [
  { field: 'service', prompt: 'Which service can we help you with?', choices: Object.entries(services) },
  { field: 'propertyType', prompt: 'What type of property is it?', choices: propertyTypes.map((value) => [value, value]) },
  { field: 'propertyAddress', prompt: 'What is the property address or community?' },
  { field: 'zip', prompt: 'What is the property’s ZIP code?', inputMode: 'numeric' },
  { field: 'details', prompt: 'Tell me a little about your project.' },
  { field: 'timeframe', prompt: 'When would you like to get started?', choices: timeframes.map((value) => [value, value]) },
  { field: 'firstName', prompt: 'What is your first name?' },
  { field: 'lastName', prompt: 'What is your last name?' },
  { field: 'email', prompt: 'What email address should IXP Homes use?', inputMode: 'email' },
  { field: 'phone', prompt: 'What’s your phone number? You can skip this step.', choices: [['Skip', 'Skip']], inputMode: 'tel' },
  { field: 'contactMethod', prompt: 'How would you like IXP Homes to contact you?', choices: [['email', 'Email'], ['phone', 'Phone']] },
  { field: 'consent', prompt: 'Do you agree that IXP Homes may contact you about this request?', choices: [['yes', 'I Agree'], ['no', 'No, Thanks']] }
]
export function answerChat(lead, index, raw) {
  const step = chatSteps[index]
  const answer = raw.trim()
  const choice = step.choices?.find((entry) => entry.some((value) => value.toLowerCase() === answer.toLowerCase()))
  const value = choice?.[0] ?? answer
  if (step.field === 'consent' && !choice) return { error: 'Choose I Agree or No, Thanks.' }
  if (step.field === 'consent' && value === 'no') return { declined: true, display: choice[1] }
  const next = { ...lead, [step.field]: step.field === 'consent' ? value === 'yes' : value === 'Skip' && step.field === 'phone' ? '' : value }
  if (step.field === 'contactMethod' && value === 'phone' && !lead.phone) {
    return { error: 'Choose Email or use Back to add a phone number.' }
  }
  const { errors } = validateLead({ ...next, source: 'chat', contactMethod: step.field === 'phone' ? 'email' : next.contactMethod })
  return errors[step.field] ? { error: errors[step.field] } : { lead: next, display: choice?.[1] ?? answer }
}
