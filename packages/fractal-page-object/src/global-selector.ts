import GlobalPageObjectFactory from './-private/global-factory';
import PageObject from './page-object';
import type { PageObjectClass } from './-private/types';
import { validateSelectorArguments } from './-private/helpers';

type Arguments<T extends PageObject> = [string, PageObjectClass<T>?];
type ArgumentsWithRoot<T extends PageObject> = [
  string,
  Element,
  PageObjectClass<T>?
];

/**
 * Define a PageObject with a global scope, i.e. not scoped by its parent
 * PageObject. Useful for content that's logically associated with its parent,
 * but renders itself in a different area of the DOM, e.g. as a child of the
 * <body> element.
 *
 * @param selector the selector
 * @param rootElement the root element under which to query the selector. If
 * none is provided, the global root will be used @see {@link setRoot}
 * @param Class optional {@link PageObject} subclass that can be used to extend
 * the functionality of this page object
 */
export default function globalSelector<T extends PageObject>(
  selector: string,
  Class?: PageObjectClass<T>
): T;
export default function globalSelector<T extends PageObject>(
  selector: string,
  rootElement: Element,
  Class?: PageObjectClass<T>
): T;
export default function globalSelector<T extends PageObject>(
  ...args: Arguments<T> | ArgumentsWithRoot<T>
): T {
  let selector = args[0];
  let rootElement;
  let Class;

  if (args[1] instanceof Element) {
    rootElement = args[1];
    Class = args[2];
  } else {
    Class = args[1];
  }

  validateSelectorArguments(selector, Class);

  // Return a factory, but typed as the class it will instantiate since the
  // proxy will do the intantiation anytime a property containing a factory is
  // accessed
  return (new GlobalPageObjectFactory(
    selector,
    rootElement,
    Class
  ) as unknown) as T;
}
