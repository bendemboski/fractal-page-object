let root: Element | undefined;

function getEmberTestRoot() {
  try {
    return window.require('@ember/test-helpers').getRootElement();
  } catch (e) {
    return null;
  }
}

/**
 * Set the global default root element -- by default {@link PageObject}s will
 * only match elements that are descendants of this element. The default root
 * element is `document.body`.
 *
 * @param {Element|Function} element the root element or a function that will
 * return it
 */
export function setRoot(element: Element) {
  root = element;
}

/**
 * Get the global default root element
 *
 * @returns the root element
 *
 * @private
 */
export function getRoot() {
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
export function resetRoot() {
  root = undefined;
}
