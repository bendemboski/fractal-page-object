import PageObject from '../page-object';

function isPageObjectSubclass(Class: any) {
  return Class === PageObject || Class.prototype instanceof PageObject;
}

export function validateSelectorArguments(selector: string, Class?: any) {
  if (!selector) {
    throw new Error('Cannot specify an empty selector');
  }
  if (Class && !isPageObjectSubclass(Class)) {
    throw new Error(
      'Custom globalSelector() class must be PageObject or PageObject subclass'
    );
  }
}
