import { LandingPage } from './pages/LandingPage.js'
import { AdminPage } from './pages/AdminPage.js'
import { AdminLogin } from './components/AdminLogin.js'
import { auth } from './auth.js'

class Router {
  constructor() {
    this.appContainer = document.getElementById('app')
    this.currentPageInstance = null
    this.routes = {
      '/': 'landing',
      '/admin': 'admin'
    }

    window.addEventListener('popstate', () => this.handleRouteChange())
    document.addEventListener('DOMContentLoaded', () => {
      this.setupNavigation()
      this.handleRouteChange()
    })
  }

  setupNavigation() {
    document.body.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[data-route]')
      if (anchor) {
        e.preventDefault()
        const path = anchor.getAttribute('href')
        this.navigate(path)
      }
    })
  }

  navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
      this.handleRouteChange()
    }
  }

  handleRouteChange() {
    const path = window.location.pathname
    const route = this.routes[path] || 'landing' // Default to landing

    if (this.currentPageInstance && typeof this.currentPageInstance.destroy === 'function') {
      this.currentPageInstance.destroy()
    }
    this.appContainer.innerHTML = '' // Clear previous content

    switch (route) {
      case 'admin':
        this.loadAdminPage()
        break
      case 'landing':
      default:
        this.loadLandingPage()
        break
    }
  }

  loadLandingPage() {
    this.appContainer.innerHTML = document.getElementById('landing-page-template').innerHTML
    this.currentPageInstance = new LandingPage()
  }

  loadAdminPage() {
    if (auth.isAuthenticated) {
      this.appContainer.innerHTML = document.getElementById('admin-page-template').innerHTML
      this.currentPageInstance = new AdminPage()
    } else {
      this.showAdminLogin()
    }
  }

  showAdminLogin() {
    this.appContainer.innerHTML = '' // Clear page
    const loginComponent = new AdminLogin(this.appContainer, (success) => {
      if (success) {
        this.loadAdminPage()
      }
    })
    loginComponent.render()
  }
}

export const router = new Router()
