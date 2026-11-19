// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom não tem matchMedia; o SloshGauge (ReactBits) chama no mount
window.matchMedia ??= (query) => ({
  matches: false, media: query, addEventListener() {}, removeEventListener() {},
});
