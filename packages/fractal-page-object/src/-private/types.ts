import type PageObject from '../page-object';
import type DOMQuery from './dom-query';

export const DOM_QUERY = Symbol('DOM query');
export const CLONE_WITH_INDEX = Symbol('withIndex');

/**
 * An interface for a {@link PageObject}'s parent page object. We use this
 * rather than just {@link PageObject} because the parent's element type might
 * be different which would severely complicate the types, but also the parent's
 * element type doesn't matter since it's just a starting point for a query. So
 * we type a page object parent to just be a {@link DOMQuery}-haver.
 */
export interface IPageObjectParent {
  readonly [DOM_QUERY]: DOMQuery;
}

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
export type WithElement<T, ElementType extends Element = Element> = T & {
  element: ElementType;
};
