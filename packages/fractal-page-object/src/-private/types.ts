import type PageObject from '../page-object';

export const DOM_QUERY = Symbol('DOM query');
export const CLONE_WITH_INDEX = Symbol('withIndex');

/**
 * A constructor for a {@link PageObject} or {@link PageObject} subclass
 */
export type PageObjectConstructor<
  ElementType extends Element,
  T extends PageObject<ElementType>
> = new (...args: ConstructorParameters<typeof PageObject<ElementType>>) => T;

/**
 * Helper type for a {@link PageObject}s and subclasses that are known to match an element
 *
 * @see {@link ArrayStub#map} etc.
 */
export type WithElement<T, ElementType extends Element> = T & {
  element: ElementType;
};
