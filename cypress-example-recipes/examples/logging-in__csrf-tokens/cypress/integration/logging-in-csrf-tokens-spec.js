// This recipe expands on the previous 'Logging in' examples
// and shows you how to use cy.request when your backend
// validates POSTs against a CSRF token
//
describe('Logging In - CSRF Tokens', function(){

  beforeEach(function(){
    cy.viewport(500, 380)
  })

  it('403 status without a valid CSRF token', function(){
    // first show that by not providing a valid CSRF token
    // that we will get a 403 status code
    // API TEST EXAMPLE, NO STUB
    cy.loginByCSRF('invalid-token')
      .its('status')
      .should('eq', 403)
  })

  it('strategy #1: parse token from HTML', function(){
    // if we cannot change our server code to make it easier
    // to parse out the CSRF token, we can simply use cy.request
    // to fetch the login page, and then parse the HTML contents
    // to find the CSRF token embedded in the page
    cy.request('/login')
      .its('body')
      .then((body) => {
        // we can use Cypress.$ to parse the string body
        // thus enabling us to query into it easily
        // grabbing the value from  <input type="hidden" name="_csrf" value=vQisdBJ9-6NqLYc8SJ6yzSrHoPnStZYtFUBE />
        const $html = Cypress.$(body)
        const csrf  = $html.find("input[name=_csrf]").val()

        // nowe we have the right csrf value
        cy.loginByCSRF(csrf)
          .then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.body).to.include("<h2>dashboard.html</h2>")
          })
      })
  })

  it('strategy #2: parse token from response headers', function(){
    // if we embed our csrf-token in response headers
    // it makes it much easier for us to pluck it out
    // without having to dig into the resulting HTML
    cy.request('/login')
      .its('headers')
      .then((headers) => {
        const csrf = headers['x-csrf-token']

        cy.loginByCSRF(csrf)
          .then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.body).to.include("<h2>dashboard.html</h2>")
          })
      })
  })

  it('strategy #3: expose CSRF via a route when not in production', function(){
    // since we are not running in production we have exposed
    // a simple /csrf route which returns us the token directly
    // as json
    cy.request('/csrf')
      .its('body.csrfToken')
      .then((csrf) => {
        cy.loginByCSRF(csrf)
          .then((resp) => {
            expect(resp.status).to.eq(200)
            expect(resp.body).to.include("<h2>dashboard.html</h2>")
          })
      })
  })
})
