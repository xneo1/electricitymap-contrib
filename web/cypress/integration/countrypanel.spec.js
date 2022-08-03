describe('Country Panel', () => {
  beforeEach(() => {
    cy.interceptAPI('v5/state/hourly');
  });

  it.skip('interacts with details', () => {
    cy.visit('/zone/DK-DK2?skip-onboarding=true');
    cy.interceptAPI('v5/history/hourly?countryCode=DK-DK2');
    cy.waitForAPISuccess('v5/state/hourly');
    cy.waitForAPISuccess('v5/history/hourly?countryCode=DK-DK2');

    cy.contains('East Denmark');
    cy.contains('Carbon Intensity');
    cy.get('.left-panel-zone-details .country-col').contains('152');
    cy.get('#country-lowcarbon-gauge').trigger('mousemove');
    cy.contains('Includes renewables and nuclear');
    cy.get('#country-lowcarbon-gauge').trigger('mouseout');

    cy.contains('Carbon emissions').should('not.have.class', 'selected');
    cy.contains('Carbon emissions').click().should('have.class', 'selected');
    cy.contains('0 t/min');
    cy.contains('Electricity consumption').click();

    // test graph tooltip
    cy.get('[data-test-id=history-carbon-graph]').trigger('mousemove', 'left');
    // ensure hovering the graph does not change underlying data
    cy.get('.left-panel-zone-details [data-test-id=co2-square-value]').should('have.text', '152');
    cy.get('input.time-slider-input').should('have.value', '1655874000000');
    // ensure tooltip is shown and changes depending on where on the graph is being hovered
    cy.get('#country-tooltip').should('be.visible');
    cy.get('#country-tooltip [data-test-id=co2-square-value]').should('have.text', '86');

    cy.get('[data-test-id=history-carbon-graph]').trigger('mouseout');
    cy.get('[data-test-id=history-carbon-graph]').trigger('mousemove', 'center');
    cy.get('#country-tooltip [data-test-id=co2-square-value]').should('have.text', '122');
    cy.get('[data-test-id=history-carbon-graph]').trigger('mouseout');

    cy.get('input.time-slider-input').setSliderValue('1655823600000');
    cy.get('.left-panel-zone-details [data-test-id=co2-square-value]').should('have.text', '108');

    cy.get('.left-panel-back-button').click();
  });

  it('asserts countryPanel contains "no-recent-data" message', () => {
    cy.visit('/zone/UA');
    cy.interceptAPI('v5/history/hourly?countryCode=UA');
    cy.waitForAPISuccess('v5/state/hourly');
    cy.waitForAPISuccess('v5/history/hourly?countryCode=UA');

    cy.get('.no-data-overlay-message')
      .should('exist')
      .contains('Data is temporarily unavailable for the selected time');
  });

  it('asserts countryPanel contains no parser message when zone has no data', () => {
    cy.visit('/zone/CN');
    cy.waitForAPISuccess('v5/state/hourly');
    cy.get('[data-test-id=no-parser-message]').should('exist');
  });
});
