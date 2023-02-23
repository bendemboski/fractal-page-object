import type PageObject from '../page-object';
import type { PageObjectConstructor } from './types';

/**
 * Create a clone of a {@link PageObject}, but with an index specified. If
 * called on an instance of a subclass of {@link PageObject}, the clone will be
 * an instance of that subclass.
 *
 * @param pageObject the page object to clone
 * @param index the index
 *
 * @returns a clone of the page object, but only selecting the DOM element in
 * the matching elements at the given index
 */
export default function cloneWithIndex<
  ElementType extends Element,
  T extends PageObject<ElementType>
>(obj: T, index: number): T {
  let Class = obj.constructor as PageObjectConstructor<
    ElementType,
    PageObject<ElementType>
  >;
  return new Class('', obj, index) as T;
}
