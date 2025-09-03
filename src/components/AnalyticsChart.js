export class AnalyticsChart {
  constructor(container, options) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    this.options = {
      type: 'bar', // 'bar', 'line'
      data: [], // { label: string, value: number }[]
      title: '',
      color: 'primary',
      ...options
    }
    this.render()
  }

  render() {
    if (!this.container) return
    this.container.innerHTML = this.getChartHTML()
  }

  getChartHTML() {
    const maxValue = Math.max(...this.options.data.map(d => d.value), 1)
    const colorClasses = {
      primary: 'bg-primary-500',
      accent: 'bg-accent-500',
      green: 'bg-green-500',
    }

    return `
      <div class="bg-white rounded-xl p-6 shadow-sm border h-full">
        <h3 class="text-lg font-bold text-secondary-700 mb-6">${this.options.title}</h3>
        <div class="flex justify-around items-end h-64 space-x-2 rtl:space-x-reverse">
          ${this.options.data.map(item => `
            <div class="flex flex-col items-center flex-1">
              <div class="relative w-full h-full flex items-end justify-center group">
                <div class="w-3/4 ${colorClasses[this.options.color] || colorClasses.primary} rounded-t-lg hover:opacity-80 transition-all" 
                     style="height: ${(item.value / maxValue) * 100}%">
                  <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${item.value}
                  </span>
                </div>
              </div>
              <div class="text-xs text-secondary-500 mt-2 text-center">${item.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }
}
