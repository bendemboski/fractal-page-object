import type PageObject from '../page-object';

/**
 * A generic page object, used in places where we don't care about the page
 * object's `ElementType`
 */
export type GenericPageObject = PageObject<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

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
