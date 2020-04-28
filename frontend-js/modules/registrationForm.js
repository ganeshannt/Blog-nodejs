export default class RegistrationFrom {
    // select DOM element and keep track of useful data
    constructor() {
        // # - select by id  and . - select by class
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.insertValidationElements()
        this.username = document.querySelector('#username-register')
        this.username.previousValue = ''
        this.events()
    }


    // events
    events() {
        this.username.addEventListener("keyup", () => {
            this.isDifferent(this.username, this.usernameHandler)
        })

    }


    // methods

    insertValidationElements() {
        this.allFields.forEach(function (el) {
            el.insertAdjacentHTML('afterend', '<div class="alert alert-danger small liveValidateMessage"></div>')
        })
    }
    //  checking the keystrokes
    isDifferent(el, handler) {
        if (el.previousValue != el.value) {
            handler.call(this)
        }
        el.previousValue = el.value
    }
    // handling the keystrokes 
    usernameHandler() {
        this.username.errors = false
        this.usernameImmediately()
        clearTimeout(this.username.timer)
        this.username.timer = setTimeout(() => this.usernameAfterDelay(), 1000)
    }
    usernameImmediately() {
        if (this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)) {
            this.showValidationErrors(this.username, 'Username only contains letters and numbers')
        }
        if (!this.username.errors) {
            this.hideValidationErrors(this.username)
        }
        if (this.username.value.length > 30) {
            this.showValidationErrors(this.username, "Username should not contain more than 30 characters")
        }

    }

    showValidationErrors(el, message) {
        el.nextElementSibling.innerHTML = message
        el.nextElementSibling.classList.add("liveValidateMessage--visible")
        el.errors = true
    }
    hideValidationErrors(el) {
        el.nextElementSibling.classList.remove("liveValidateMessage--visible")
    }


    usernameAfterDelay() {
        if (this.username.value.length < 3) {
            this.showValidationErrors(this.username, "Username should contain atleast 3 characters")
        }
    }
}