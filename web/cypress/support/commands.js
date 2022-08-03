// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * The setSliderValue command will set the value of a input[type=range] element.
 * See https://github.com/cypress-io/cypress/issues/1570#issuecomment-891244917
 */
Cypress.Commands.add('setSliderValue', { prevSubject: 'element' }, (subject, value) => {
  const element = subject[0];

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

  nativeInputValueSetter?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
});
// TypeScript declaration for future use
// declare namespace Cypress {
//     interface Chainable {
//         setSliderValue(value: number): Chainable<void>
//     }
// }

Cypress.Commands.add('interceptAPI', (path) => {
  const [pathWithoutParams, params] = path.split('?');
  let fixturePath = pathWithoutParams;
  // Change fixture path if countryCode query parameter is used to use correct response
  if (params && params.includes('countryCode')) {
    const zone = params.split('=')[1];
    fixturePath = pathWithoutParams.replace('/history/hourly', `/history/${zone}/hourly`);
  }
  cy.intercept('GET', `http://localhost:8001/${path}`, {
    fixture: `${fixturePath}.json`,
  }).as(path);
});
Cypress.Commands.add('waitForAPISuccess', (path) => {
  cy.wait(`@${path}`)
    .its('response.statusCode')
    .should('match', /200|304/);
});

Cypress.Commands.add('visitOnMobile', (path) => {
  cy.viewport('iphone-6');
  cy.visit(path, {
    onBeforeLoad: (win) => {
      win.ontouchstart = true;
      Object.defineProperty(win.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      });
    },
  });
});
