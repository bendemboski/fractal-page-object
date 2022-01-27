import type PageObject from '../page-object';

export const DOM_QUERY = Symbol('DOM query');
export const CLONE_WITH_INDEX = Symbol('withIndex');

/**
 * A constructor for a {@link PageObject} or {@link PageObject} subclass
 */
export type PageObjectConstructor<T extends PageObject> = new (
  ...args: ConstructorParameters<typeof PageObject>
) => T | PageObject;

/**
 * A utility interface that can be unioned with a {@link PageObject}
 * to denote that the `element` is _known_ to exist
 */
export interface WithElement {
  element: Element;
}
