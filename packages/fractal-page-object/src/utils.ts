import { DOM_QUERY, WithElement } from './-private/types';

import type { default as PageObject } from './page-object';

/**
 * Useful for providing clarity to consumers of page-objects
 * to provide additional context so "can't access property on undefined"
 * errors do not public up to the consumer.
 *
 * In typescript, this is also useful for type-narrowing so that
 * you can pass on the element to other utilities.
 *
 * @example
 *
 * let page = new Page();
 *
 * assertExists('is the element on the page?', page);
 *
 * await click(page.element);
 *
 * @param {string} msg a descriptor for what it could mean when the element doesn't exist
 * @param {PageObject} pageObject the page object
 */
export function assertExists(
  msg: string,
  pageObject: PageObject
): asserts pageObject is WithElement<PageObject> {
  if (!pageObject.element) {
    throw new Error(
      `${msg} >> Tried selector \`${getDescription(pageObject)}\``
    );
  }
}

/**
 * Utility to get the fully resolved selector path of a {@link PageObject}
 */
export function getDescription(pageObject: PageObject): string {
  return pageObject[DOM_QUERY].selectorArray.toString();
}
