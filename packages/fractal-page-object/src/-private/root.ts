let root: Element | undefined;

function getEmberTestRoot() {
  // Ideally we would detect if we are running in Ember and if so use
  // `@ember/test-helpers` to get the test root. But there's no straightforward
  // way to do that when building a static package under embroider. Perhaps we
  // could make this library also an Ember addon, and then play some build-time
  // tricks to get us the information we need here, but for now the testing root
  // is always `#ember-testing` unless the user is doing something pretty funky,
  // and if they are, they can always use `setRoot()` to explicitly configure
  // their testing root. So let's do the embroider-friendly, zero-config, easy
  // thing, and just look for an `#ember-testing` element.
  return document.querySelector('#ember-testing');
}

/**
 * Set the global default root element -- by default {@link PageObject}s will
 * only match elements that are descendants of this element. The default root
 * element is `document.body`.
 *
 * @param {Element|Function} element the root element or a function that will
 * return it
 */
export function setRoot(element: Element): void {
  root = element;
}

/**
 * Get the global default root element
 *
 * @returns the root element
 *
 * @private
 */
export function getRoot(): Element {
  if (root instanceof Element) {
    return root;
  } else {
    return getEmberTestRoot() || document.body;
  }
}

/**
 * Reset the global default root element to its default (used for testing)
 *
 * @private
 */
export function resetRoot(): void {
  root = undefined;
}
