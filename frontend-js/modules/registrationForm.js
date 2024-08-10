import axios from 'axios'

export default class RegistrationFrom {
  // select DOM element and keep track of useful data
  constructor() {
    // # - select by id  and . - select by class
    // selection done by input name value
    this._csrf = document.querySelector('[name = "_csrf"]').value
    this.form = document.querySelector('#registration-form')
    this.allFields = document.querySelectorAll(
      '#registration-form .form-control'
    )
    this.insertValidationElements()
    this.username = document.querySelector('#username-register')
    this.username.previousValue = ''
    this.email = document.querySelector('#email-register')
    this.email.previousValue = ''
    this.password = document.querySelector('#password-register')
    this.password.previousValue = ''
    this.username.isUnique = false
    this.email.isUnique = false
    this.events()
  }

  // events
  events() {
    this.form.addEventListener('submit', e => {
      e.previousValue()
      this.formSubmitHandler()
    })
    this.username.addEventListener('keyup', () => {
      this.isDifferent(this.username, this.usernameHandler)
    })

    this.email.addEventListener('keyup', () => {
      this.isDifferent(this.email, this.emailHandler)
    })
    this.password.addEventListener('keyup', () => {
      this.isDifferent(this.password, this.passwordHandler)
    })

    // events to focus while get faster input and switching between fields
    this.username.addEventListener('blur', () => {
      this.isDifferent(this.username, this.usernameHandler)
    })
    this.email.addEventListener('blur', () => {
      this.isDifferent(this.email, this.emailHandler)
    })
    this.password.addEventListener('blur', () => {
      this.isDifferent(this.password, this.passwordHandler)
    })
  }

  // methods

  insertValidationElements() {
    this.allFields.forEach(function (el) {
      el.insertAdjacentHTML(
        'afterend',
        '<div class="alert alert-danger small liveValidateMessage"></div>'
      )
    })
  }
  //  checking the keystrokes
  isDifferent(el, handler) {
    if (el.previousValue != el.value) {
      handler.call(this)
    }
    el.previousValue = el.value
  }
  //  method to display errors
  showValidationErrors(el, message) {
    el.nextElementSibling.innerHTML = message
    el.nextElementSibling.classList.add('liveValidateMessage--visible')
    el.errors = true
  }
  // method to hide errors
  hideValidationErrors(el) {
    el.nextElementSibling.classList.remove('liveValidateMessage--visible')
  }
  // Username validation methods
  // handling the keystrokes
  usernameHandler() {
    this.username.errors = false
    this.usernameImmediately()
    clearTimeout(this.username.timer)
    this.username.timer = setTimeout(() => this.usernameAfterDelay(), 1000)
  }
  usernameImmediately() {
    if (
      this.username.value != '' &&
      !/^([a-zA-Z0-9]+)$/.test(this.username.value)
    ) {
      this.showValidationErrors(
        this.username,
        'Username only contains letters and numbers'
      )
    }
    if (!this.username.errors) {
      this.hideValidationErrors(this.username)
    }
    if (this.username.value.length > 30) {
      this.showValidationErrors(
        this.username,
        'Username should not contain more than 30 characters'
      )
    }
  }

  usernameAfterDelay() {
    if (this.username.value != '' && this.username.value.length < 3) {
      this.showValidationErrors(
        this.username,
        'Username should contain atleast 3 characters'
      )
    }

    if (!this.username.errors) {
      axios
        .post('/doesUsernameExist', {
          _csrf: this._csrf,
          username: this.username.value
        })
        .then(response => {
          if (response.data) {
            this.showValidationErrors(this.username, 'Username already taken')
            this.username.isUnique = false
          } else {
            this.username.isUnique = true
          }
        })
        .catch(() => {
          console.log('Unexpected error happen')
        })
    }
  }
  // Email validation methods
  emailHandler() {
    this.email.errors = false
    this.emailImmediately()
    clearTimeout(this.email.timer)
    this.email.timer = setTimeout(() => this.emailAfterDelay(), 1000)
  }
  emailImmediately() {
    if (!this.email.errors) {
      this.hideValidationErrors(this.email)
    }
  }
  emailAfterDelay() {
    if (this.email.value != '' && !/^\S+@\S+$/.test(this.email.value)) {
      this.showValidationErrors(this.email, 'Invalid email address')
    }
    if (!this.email.errors) {
      axios
        .post('/doesEmailExist', { _csrf: this._csrf, email: this.email.value })
        .then(response => {
          if (response.data) {
            this.showValidationErrors(this.email, 'Email already existing')
            this.email.isUnique = false
          } else {
            this.email.isUnique = true
            this.hideValidationErrors(this.email)
          }
        })
        .catch(() => {
          console.log('Unexpected error happen')
        })
    }
  }

  // password validation methods
  passwordHandler() {
    this.password.errors = false
    this.passwordImmediately()
    clearTimeout(this.password.timer)
    this.password.timer = setTimeout(() => this.passwordAfterDelay(), 1000)
  }
  passwordImmediately() {
    if (!this.password.errors) {
      this.hideValidationErrors(this.password)
    }
  }
  passwordAfterDelay() {
    if (
      (this.password.value != '' && this.password.value.length < 5) ||
      this.password.value.length > 15
    ) {
      this.showValidationErrors(
        this.password,
        'Password should contain character between 5 to 15'
      )
    }
  }

  // form submit validation method
  formSubmitHandler() {
    this.usernameImmediately()
    this.usernameAfterDelay()
    this.emailImmediately()
    this.emailAfterDelay()
    this.passwordImmediately()
    this.passwordAfterDelay()

    if (
      this.username.isUnique &&
      !this.username.errors &&
      this.email.isUnique &&
      !this.email.errors &&
      !this.password.errors
    ) {
      this.form.submit()
    }
  }
}
