import { expect, test, type Page } from '@playwright/test'

async function nav(page: Page, label: string) {
  const menu = page.getByRole('button', { name: 'Open menu' })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: label, exact: true }).click()
}

test('navigates all pages, serves crawlable content, and fits the viewport', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home services. Inside and out.')
  await expect(page.locator('.hero-image')).toBeVisible()
  await expect(page.locator('.hero-image')).toHaveAttribute('src', '/images/hero/waterfront.webp')
  await expect.poll(() => page.locator('.hero-image').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
  await nav(page, 'Services')
  await page.getByRole('link', { name: 'Details about Dryer Vent Cleaning' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dryer Vent Cleaning')
  await expect(page).toHaveTitle(/Dryer Vent Cleaning/)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const service of ['drone-inspections', 'home-remodeling', 'bathroom-remodeling']) {
    expect((await request.get('/services/' + service)).status()).toBe(404)
    expect(sitemap).not.toContain(service)
  }
  expect(sitemap).toContain('/services/landscaping-projects')
  for (const path of ['/services', '/services/home-inspections', '/services/pressure-washing', '/services/dryer-vent-cleaning', '/services/home-maintenance', '/services/luxury-property-care', '/about', '/service-areas', '/contact', '/estimate', '/instant-quote', '/privacy', '/terms', '/services/flooring-installation', '/services/tile-installation', '/services/interior-painting', '/services/landscaping-projects', '/services/drywall-repair', '/services/door-installation', '/services/tv-mounting', '/services/trim-carpentry']) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(await response.text()).toMatch(/<h1>[\s\S]+<\/h1>/)
  }
  const missing = await page.goto('/does-not-exist')
  expect(missing?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Page not found.' })).toBeVisible()
  await page.getByRole('link', { name: 'Return Home' }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth))
  expect(errors).toEqual([])
})

test('the homepage and header link to the dedicated About page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('main').getByRole('link', { name: 'About IXP Homes', exact: true }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About IXP Homes')
  await expect(page.getByRole('heading', { name: 'What to expect' })).toBeVisible()
  await expect(page.getByRole('main').getByRole('link', { name: 'See Service Areas' })).toHaveAttribute('href', '/service-areas')
  await expect(page.getByRole('main').getByRole('link', { name: /Call \(904\) 899-2003/ })).toHaveAttribute('href', 'tel:+19048992003')
  await page.goto('/services')
  await nav(page, 'About')
  await expect(page).toHaveURL(/\/about$/)
})

for (const path of ['/', '/services']) {
  test('service grid reveals pricing without moving the quote link on ' + path, async ({ page }) => {
    await page.goto(path)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('.service-grid')).toHaveCount(1)
    await expect(page.locator('.service-card')).toHaveCount(13)
    const card = page.locator('.service-card').filter({ has: page.getByRole('link', { name: 'Details about Pressure Washing' }) })
    const details = card.locator('.card-preview')
    const toggle = card.getByRole('button', { name: 'Quick info for Pressure Washing' })
    const quote = card.getByRole('link', { name: 'Pressure Washing: Instant Quote' })
    const price = card.getByText('$120–$200 for a driveway', { exact: true })
    const quotePosition = () => quote.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y + window.scrollY }
    })
    const originalPosition = await quotePosition()
    await expect(details).toBeHidden()
    await expect(price).toBeHidden()
    await expect(card.getByText('Clear grime and algae from driveways, pavers, and patios.', { exact: true })).toBeHidden()
    if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
      await quote.hover()
      await expect(price).toBeVisible()
      expect(await quotePosition()).toEqual(originalPosition)
      await page.keyboard.press('Escape')
      await expect(details).toBeHidden()
      await page.mouse.move(5, 5)
      await toggle.focus()
      await page.keyboard.press('Enter')
    } else {
      await toggle.tap()
    }
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(details).toContainText('surface grime and algae')
    await expect(price).toBeVisible()
    expect(await quotePosition()).toEqual(originalPosition)
    await toggle.click()
    await expect(details).toBeHidden()
    expect(await quotePosition()).toEqual(originalPosition)
  })
}

test('call link and instant quotes are available from the homepage and service pages', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Call Us Now/ })).toHaveAttribute('href', 'tel:+19048992003')
  await page.locator('.hero').getByRole('link', { name: 'Get an Instant Quote' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Get an Instant Quote')
  await page.getByRole('button', { name: 'Show My Estimate' }).click()
  await expect(page.locator('.quote-result')).toContainText('Starts at $177')
  await page.getByLabel('Project scope').selectOption({ label: 'Roof exit, difficult access, or multiple vents' })
  await expect(page.getByRole('link', { name: 'Request a Custom Quote' })).toBeVisible()
  await expect(page.locator('.quote-result')).toHaveCount(0)

  await page.goto('/services/flooring-installation')
  await page.locator('.page-intro').getByRole('link', { name: 'Get an Instant Quote' }).click()
  await expect(page.getByLabel('Choose a service')).toHaveValue('flooring-installation')
  const area = page.getByLabel('Floor area (sq. ft.)')
  await area.fill('250')
  await page.getByRole('button', { name: 'Show My Estimate' }).click()
  await expect(page.locator('.quote-result')).toContainText('$2,000–$4,250')
  await expect(page.locator('.quote-result')).toContainText('Jacksonville-area planning estimate')
  await page.getByRole('link', { name: 'Request a Written Quote' }).click()
  await expect(page.getByLabel('Service', { exact: true })).toHaveValue('flooring-installation')
  const next = page.getByRole('button', { name: 'Continue', exact: true })
  await next.click()
  await page.getByLabel('Property address').fill('Demo property')
  await page.getByLabel('ZIP code').fill('32250')
  await page.getByLabel('Property type').selectOption('Single-family home')
  await next.click()
  await expect(page.getByLabel('Project description')).toHaveValue(/Luxury vinyl plank.*250/)
  await page.goto('/instant-quote')
  await page.getByLabel('Choose a service').selectOption('landscaping-projects')
  await page.getByRole('link', { name: 'Request a Custom Quote' }).click()
  await expect(page.getByLabel('Service', { exact: true })).toHaveValue('landscaping-projects')
})

test('estimate prefill, validation, error recovery, and confirmation', async ({ page }) => {
  let submissions = 0
  await page.route('**/api/leads', async (route) => {
    const payload = route.request().postDataJSON()
    expect(payload.service).toBe('dryer-vent-cleaning')
    expect(payload.email).toBe('jamie@example.com')
    expect(payload.source).toBe('estimate')
    expect(payload.consent).toBe(true)
    submissions++
    await route.fulfill({ status: submissions === 1 ? 502 : 201, json: submissions === 1 ? { message: 'Please retry.' } : { ok: true } })
  })
  await page.goto('/estimate?service=dryer-vent-cleaning')
  await expect(page.getByLabel('Service', { exact: true })).toHaveValue('dryer-vent-cleaning')
  const next = page.getByRole('button', { name: 'Continue', exact: true })
  await next.click()
  await next.click()
  await expect(page.getByText('Enter the property location.')).toBeVisible()
  await page.getByLabel('Property address').fill('Demo property')
  await page.getByLabel('ZIP code').fill('32250')
  await page.getByLabel('Property type').selectOption('Single-family home')
  await next.click()
  await page.getByLabel('Project description').fill('Clean the dryer exhaust vent.')
  await page.getByLabel('Preferred timeframe').selectOption('Flexible')
  await next.click()
  await page.getByLabel('First name').fill('Jamie')
  await page.getByLabel('Last name').fill('Sample')
  await page.getByLabel('Email', { exact: true }).fill('jamie@example.com')
  await page.getByLabel('Phone', { exact: true }).fill('904-555-0101')
  await page.getByRole('checkbox', { name: /I agree/ }).check()
  await next.click()
  const send = page.getByRole('button', { name: 'Submit Request' })
  await send.click()
  await expect(page.getByRole('alert')).toHaveText('Please retry.')
  await send.click()
  await expect(page.getByRole('heading', { name: 'Your request was received.' })).toBeVisible()
})

test('chat retains progress through navigation and submits an inquiry', async ({ page }) => {
  await page.route('**/api/leads', async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({ source: 'chat', service: 'dryer-vent-cleaning', phone: '', consent: true })
    await route.fulfill({ status: 201, json: { ok: true } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Chat', exact: true }).click()
  const chat = page.getByRole('region', { name: 'IXP Homes Assistant' })
  await chat.getByRole('button', { name: 'Dryer Vent Cleaning' }).click()
  await chat.getByRole('button', { name: 'Minimize chat' }).click()
  await nav(page, 'About')
  await page.getByRole('button', { name: 'Chat', exact: true }).click()
  await chat.getByRole('button', { name: 'Single-family home' }).click()
  for (const value of ['Jacksonville Beach', '32250', 'Clean the dryer exhaust vent.']) {
    await chat.getByRole('textbox', { name: 'Your reply' }).fill(value)
    await chat.getByRole('button', { name: 'Reply', exact: true }).click()
  }
  await chat.getByRole('button', { name: 'Flexible', exact: true }).click()
  for (const value of ['Jamie', 'Sample', 'jamie@example.com']) {
    await chat.getByRole('textbox', { name: 'Your reply' }).fill(value)
    await chat.getByRole('button', { name: 'Reply', exact: true }).click()
  }
  await chat.getByRole('button', { name: 'Skip', exact: true }).click()
  await chat.getByRole('button', { name: 'Email', exact: true }).click()
  await chat.getByRole('button', { name: 'I Agree', exact: true }).click()
  await chat.getByRole('button', { name: 'Send Inquiry' }).click()
  await expect(chat.getByText(/Your request was received/)).toBeVisible()
})

test('chat stays above the footer while browsing and when open', async ({ page }) => {
  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Chat', exact: true })
  await expect(launcher).toBeInViewport()
  const footer = page.getByRole('contentinfo')
  await footer.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY - window.innerHeight * .7
    window.scrollTo({ top, behavior: 'instant' })
  })
  async function gapAboveFooter(selector: string) {
    return footer.evaluate((element, chatSelector) => {
      const chat = document.querySelector(chatSelector)
      return chat ? element.getBoundingClientRect().top - chat.getBoundingClientRect().bottom : 0
    }, selector)
  }
  await expect.poll(() => gapAboveFooter('.chat-launcher')).toBeGreaterThanOrEqual(11)
  await launcher.click()
  await expect(page.getByRole('region', { name: 'IXP Homes Assistant' })).toBeInViewport()
  await expect.poll(() => gapAboveFooter('.chat-panel')).toBeGreaterThanOrEqual(11)
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  await expect.poll(() => gapAboveFooter('.chat-panel')).toBeGreaterThanOrEqual(11)
  await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toBeInViewport()
})

test('popup waits for engagement, respects chat and stays dismissed after reload', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Chat', exact: true }).click()
  const popup = page.getByRole('dialog', { name: 'Your Home Is Worth Protecting.' })
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
  await page.clock.fastForward(46_000)
  await expect(popup).toBeHidden()
  await page.getByRole('button', { name: 'Minimize chat' }).click()
  await expect(popup).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(popup).toBeHidden()
  await page.reload()
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
  await page.clock.fastForward(46_000)
  await expect(popup).toBeHidden()
})

test('before-and-after slider responds to keyboard input', async ({ page }) => {
  await page.goto('/services/pressure-washing')
  const slider = page.getByRole('slider')
  await slider.focus()
  await slider.press('ArrowRight')
  await expect(slider).toHaveValue('51')
})
