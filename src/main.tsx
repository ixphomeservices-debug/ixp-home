import '@fontsource-variable/manrope'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/fraunces/wght-italic.css'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import './styles/site.css'

const container = document.getElementById('root')!
const app = <BrowserRouter><App /></BrowserRouter>
if (container.firstElementChild) hydrateRoot(container, app)
else createRoot(container).render(app)
