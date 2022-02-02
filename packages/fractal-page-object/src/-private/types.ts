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
 * Helper type for a {@link PageObject}s and subclasses that are known to match an element
 *
 * @see {@link ArrayStub#map} etc.
 */
export type WithElement<T> = T & { element: Element };
