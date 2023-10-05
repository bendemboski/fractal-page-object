import PageObjectFactory from './factory';
import type PageObject from '../page-object';
import cloneWithIndex from './clone-with-index';
import { ElementLike } from './types';

/**
 * Create a proxy wrapping a {@link PageObject} and implementing array
 * functionality.
 *
 * @param PageObject the page object to wrap in a proxy
 *
 * @returns the proxy implementing the page object & array functionality
 */
export default function createProxy<ElementType extends ElementLike>(
  pageObject: PageObject<ElementType>
): PageObject<ElementType> {
  return new Proxy(pageObject, {
    get(pageObject, prop: string, receiver) {
      if (Reflect.has(pageObject, prop)) {
        // The PageObject (or subclass) implements this property, e.g. `element`
        // or `elements` or a property/method on whatever subclass of PageObject
        // `pageObject` is. So, get the value with factory support.
        return getWithFactorySupport(pageObject, prop, receiver);
      }

      let index = convertToInt(prop);
      if (index !== null) {
        // `page.foo[1]` -- clone the page object with an index. We special case
        // this rather than handling it like the rest of the Array API because
        // we want users to be use an index for which there isn't actually a
        // matching element in the DOM and still get a valid page object (just
        // without an element), e.g. `assert.notOk(page.foo[3].element)`
        return cloneWithIndex(pageObject, index);
      }

      if (Reflect.has([], prop)) {
        // Array API method/property, so create an array with page objects with
        // indices wrapping all of our matching elements and apply the
        // method/property to it. It should be possible to populate PageObject
        // (since it's an Array subclass) with the child page objects and
        // operate on that, but if we do this, something about how we set up
        // PageObjects and their prototypes, and possibly how the code in
        // transpiled, causes `pageObject.map(...)` to construct and return a
        // PageObject with its parent set to an integer (instead of a page
        // object parent).
        let arrayProp = prop as keyof Array<unknown>;
        let elements = pageObject.elements;
        let children = elements.map((_e, i) => cloneWithIndex(pageObject, i));
        let value = children[arrayProp];
        if (typeof value === 'function') {
          return value.bind(children);
          // return (...args: unknown[]) =>
          //   (value as (...args: unknown[]) => unknown).call(children, ...args);
        } else {
          return value;
        }
      }
    },
  });
}

/**
 * A child-node-aware wrapper for Reflect.get() that detects when the return
 * value is a {@link PageObjectFactory} and uses it to instantiate a
 * {@link PageObject} under the given parent
 *
 * @param pageObject the page object whose property we're getting
 * @param prop the property name to get
 * @param receiver the proxy receiver
 *
 * @returns the resolved property value, which will be a constructed
 * {@link PageObject} if the actual property value is a
 * {@link PageObjectFactory}
 */
function getWithFactorySupport<ElementType extends ElementLike>(
  pageObject: PageObject<ElementType>,
  prop: string,
  receiver: unknown
) {
  let value = Reflect.get(pageObject, prop, receiver);
  if (value instanceof PageObjectFactory) {
    // PageObjetFactory, so use it to instantiate a PageObject that is a child
    // of this PageObject
    return value.create(pageObject);
  } else {
    // Some other value -- just return it
    return value;
  }
}

// Thanks @pzuraq (copied from tracked-built-ins)
function convertToInt(prop: number | string | symbol): number | null {
  if (typeof prop === 'symbol') return null;

  let num = Number(prop);

  if (isNaN(num)) return null;

  return num % 1 === 0 ? num : null;
}
