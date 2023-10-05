import PageObject from '../page-object';
import safeSelector from './safe-selector';
import type { ElementLike, PageObjectConstructor } from './types';

function isPageObjectSubclass<
  ElementType extends ElementLike,
  T extends PageObject<ElementType>
>(Class: PageObjectConstructor<ElementType, T>) {
  return (
    (Class as unknown) === PageObject || Class.prototype instanceof PageObject
  );
}

export function validateSelectorArguments<
  ElementType extends ElementLike,
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
