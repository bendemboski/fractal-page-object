import PageObject from '../page-object';
import type { PageObjectConstructor } from './types';

function isPageObjectSubclass<
  ElementType extends Element,
  T extends PageObject<ElementType>
>(Class: PageObjectConstructor<ElementType, T>) {
  return (
    (Class as unknown) === PageObject || Class.prototype instanceof PageObject
  );
}

/**
 * Make a selector safe to pass to querySelector()/querySelectorAll(). We
 * construct selectors from fragments in each page object, we want to be able to
 * support a page object specifying things like `> .foo`, which isn't
 * technically a valid selector, i.e. will error if passed to
 * querySelector()/querySelectorAll(). So in order to ensure that we can
 * tolerate such selectors, we prepend `:scope `, which will be a no-op for
 * valid selectors, and will turn technically invalid but still sensical
 * selectors like `> .foo` into a valid selector.
 */
export function safeSelector(selector: string): string {
  return `:scope ${selector}`;
}

export function validateSelectorArguments<
  ElementType extends Element,
  T extends PageObject<ElementType>
>(selector: string, Class?: PageObjectConstructor<ElementType, T>): void {
  if (!selector.trim()) {
    throw new Error('Cannot specify an empty selector');
  }

  try {
    document.querySelector(selector);
  } catch (e) {
    try {
      document.querySelector(safeSelector(selector));
    } catch (e) {
      throw new Error(`Selector is invalid: ${selector}`);
    }
  }

  if (Class && !isPageObjectSubclass(Class)) {
    throw new Error(
      'Custom selector()/globalSelector() class must be PageObject or PageObject subclass'
    );
  }
}
