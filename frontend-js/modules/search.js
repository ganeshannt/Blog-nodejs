import axios from 'axios'

export default class Search {
  // select DOM element and keep track of useful data
  constructor() {
    // # - select by id  and . - select by class
    this._csrf = document.querySelector('[name = "_csrf"]').value
    this.injectHTML()
    this.headSearchIcon = document.querySelector('.header-search-icon')
    this.overlay = document.querySelector('.search-overlay')
    this.closeIcon = document.querySelector('.close-live-search')
    this.inputField = document.querySelector('#live-search-field')
    this.resultsArea = document.querySelector('.live-search-results')
    this.loaderIcon = document.querySelector('.circle-loader')
    this.typingWaitTimer
    this.previousValue = ''
    this.event()
  }

  // event
  event() {
    this.inputField.addEventListener('keyup', () => this.keyPressHandler())
    this.closeIcon.addEventListener('click', () => {
      this.closeOverLary()
    })
    this.headSearchIcon.addEventListener('click', e => {
      e.preventDefault()
      this.openOverLay()
    })
  }

  // method
  openOverLay() {
    this.overlay.classList.add('search-overlay--visible')
    setTimeout(() => this.inputField.focus(), 50)
  }
  closeOverLary() {
    this.overlay.classList.remove('search-overlay--visible')
  }
  keyPressHandler() {
    let value = this.inputField.value

    if (value == '') {
      clearTimeout(this.typingWaitTimer)
      this.hideLoaderIcon()
      this.hideResultArea()
    }

    if (value != '' && value != this.previousValue) {
      clearTimeout(this.typingWaitTimer)
      this.showLoaderIcon()
      this.hideResultArea()
      this.typingWaitTimer = setTimeout(() => this.sendResquest(), 3000)
    }
    this.previousValue = value
  }

  sendResquest() {
    axios
      .post('/search', { _csrf: this._csrf, searchTerm: this.inputField.value })
      .then(response => {
        console.log(response.data)
        this.renderResultHTML(response.data)
      })
      .catch(() => {
        alert('catch block working')
      })
  }

  showLoaderIcon() {
    this.loaderIcon.classList.add('circle-loader--visible')
  }
  hideLoaderIcon() {
    this.loaderIcon.classList.remove('circle-loader--visible')
  }
  showResultArea() {
    this.loaderIcon.classList.add('live-search-results--visible')
  }
  hideResultArea() {
    this.loaderIcon.classList.remove('live-search-results--visible')
  }

  renderResultHTML(posts) {
    if (posts.length) {
      this.resultsArea.innerHTML = `<div class="list-group shadow-sm">
        <div class="list-group-item active"><strong>Search Results</strong> (${posts.length > 1 ? `${posts.length} items found` : '1 item found'})</div>
        ${posts
          .map(post => {
            let postDate = new Date(post.createdDate)
            return `<a href="/post/${post._id}" class="list-group-item list-group-item-action">
          <img class="avatar-tiny" src="${post.author.avatar}"> <strong>${post.title}</strong>
          <span class="text-muted small">by ${post.author.username} on ${postDate.getMonth()}/${postDate.getDate()}/${postDate.getFullYear()}</span>
        </a>`
          })
          .join('')}
      </div>`
    } else {
      this.resultsArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search.</p>`
    }
    this.hideLoaderIcon()
    this.showResultArea()
  }

  injectHTML() {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="search-overlay">
      <div class="search-overlay-top shadow-sm">
        <div class="container container--narrow">
          <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
          <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
          <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
        </div>
      </div>
  
      <div class="search-overlay-bottom">
        <div class="container container--narrow py-3">
          <div class="circle-loader"></div>
          <div class="live-search-results live-search-results--visible"></div>
        </div>
      </div>
    </div>`
    )
  }
}
