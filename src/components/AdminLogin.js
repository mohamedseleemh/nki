import { auth } from '../auth.js'
import { LoadingSpinner } from './LoadingSpinner.js'

export class AdminLogin {
  constructor(container, onLoginCallback) {
    this.container = container
    this.onLoginCallback = onLoginCallback
    this.isLoading = false
  }

  render() {
    this.container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-secondary-50 p-4">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 card-shadow">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold gradient-text">
              <i class="fas fa-user-shield ml-3"></i>
              تسجيل دخول الإدارة
            </h1>
            <p class="text-secondary-500 mt-2">مرحباً بعودتك! يرجى إدخال كلمة المرور.</p>
          </div>
          <form id="adminLoginForm" class="space-y-6">
            <div class="form-group">
              <label for="adminPassword" class="block text-lg font-semibold text-secondary-700 mb-3">
                <i class="fas fa-lock ml-2 text-primary-500"></i>
                كلمة المرور
              </label>
              <input type="password" id="adminPassword" name="adminPassword" class="form-input text-center text-xl tracking-widest" required>
            </div>
            <button type="submit" id="loginButton" class="w-full btn-primary text-xl py-4">
              <i class="fas fa-sign-in-alt ml-3"></i>
              دخــــول
            </button>
          </form>
        </div>
      </div>
    `
    this.setupEventListeners()
  }

  setupEventListeners() {
    const form = this.container.querySelector('#adminLoginForm')
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleLogin()
    })
  }

  async handleLogin() {
    if (this.isLoading) return

    const passwordInput = this.container.querySelector('#adminPassword')
    const loginButton = this.container.querySelector('#loginButton')
    const password = passwordInput.value

    this.isLoading = true
    const originalButtonHTML = loginButton.innerHTML
    loginButton.disabled = true
    loginButton.innerHTML = `
      <div class="flex items-center justify-center">
        <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
        جاري التحقق...
      </div>`

    const success = await auth.login(password)
    
    this.isLoading = false
    loginButton.disabled = false
    loginButton.innerHTML = originalButtonHTML

    if (success) {
      this.onLoginCallback(true)
    } else {
      passwordInput.classList.add('border-red-500')
      setTimeout(() => passwordInput.classList.remove('border-red-500'), 2000)
    }
  }
}
