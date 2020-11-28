import type PageObject from '../page-object';

export const DOM_QUERY = Symbol('DOM query');
export const CLONE_WITH_INDEX = Symbol('withIndex');

export type PageObjectClass<T extends PageObject> = new (
  ...args: ConstructorParameters<typeof PageObject>
) => T | PageObject;
