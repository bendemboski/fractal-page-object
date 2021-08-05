import PageObject from '../page-object';
import type { PageObjectClass } from './types';

function isPageObjectSubclass<T extends PageObject>(Class: PageObjectClass<T>) {
  return Class === PageObject || Class.prototype instanceof PageObject;
}

export function validateSelectorArguments<T extends PageObject>(
  selector: string,
  Class?: PageObjectClass<T>
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
