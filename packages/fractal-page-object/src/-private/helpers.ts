import PageObject from '../page-object';
import type { PageObjectConstructor } from './types';

function isPageObjectSubclass<T extends PageObject>(
  Class: PageObjectConstructor<T>
) {
  return Class === PageObject || Class.prototype instanceof PageObject;
}

export function validateSelectorArguments<T extends PageObject>(
  selector: string,
  Class?: PageObjectConstructor<T>
): void {
  if (!selector) {
    throw new Error('Cannot specify an empty selector');
  }
  if (Class && !isPageObjectSubclass(Class)) {
    throw new Error(
      'Custom globalSelector() class must be PageObject or PageObject subclass'
    );
  }
}
