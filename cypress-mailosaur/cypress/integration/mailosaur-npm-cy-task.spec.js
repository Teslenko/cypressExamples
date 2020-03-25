import { internet } from 'faker';
import { createEmail} from '../support/mailosaur-helper';
  
describe('tests with Mailosaur npm package and cy.task', function () {

    it('tests sanity with npm Mailosaur package', function() {
      cy.task('checkServerName').should('eq', Cypress.env('MAILOSAUR_SERVERNAME'));
    });

    it('generates a random email address with mailosaur client', function() {
      cy.task('createEmail').should('include', Cypress.env('MAILOSAUR_SERVERID'));
    });

    it('gets email from user', function() {
      const userEmail = createEmail(internet.userName());
      cy.task('sendSimpleEmail', userEmail);
      cy.task('findMessage', userEmail);
    });
  });