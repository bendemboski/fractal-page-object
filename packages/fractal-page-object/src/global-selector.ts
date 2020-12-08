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
 * Define a {@link PageObject} with a global scope, i.e. not scoped by its
 * parent page object. Useful for cases like popovers and dropdowns, where the
 * UI control is logically inside a given component, but all or part of it
 * renders elsewhere in the DOM, such as directly under the body.
 * {@link globalSelector} accepts a selector and optional custom class like
 * {@link selector()}, but the queries of the page objects it generates will be
 * executed from the root (`document.body` or whatever was passed to
 * {@link setRoot}) rather than the parent page object's elements.
 *
 * In some cases, it makes sense to set up a global root using {@link setRoot},
 * but some elements might be rendered outside even that, such as directly under
 * the body. For cases like this, {@link globalSelector} accepts an optional
 * root element to use as the root of the queries of the page object it
 * generates.
 *
 * @param {string} selector the selector
 * @param {Function<PageObject>} [Class] optional {@link PageObject} subclass that
 * can be used to extend the functionality of this page object
 *
 * @returns {PageObject} a {@link PageObject} or {@link PageObject} subclass
 * instance
 */
export default function globalSelector<T extends PageObject>(
  selector: string,
  Class?: PageObjectClass<T>
): T;

/**
 * Define a {@link PageObject} with a global scope, i.e. not scoped by its
 * parent page object. Useful for cases like popovers and dropdowns, where the
 * UI control is logically inside a given component, but all or part of it
 * renders elsewhere in the DOM, such as directly under the body.
 * {@link globalSelector} accepts a selector and optional custom class like
 * {@link selector()}, but the queries of the page objects it generates will be
 * executed from the root (`document.body` or whatever was passed to
 * {@link setRoot}) rather than the parent page object's elements.
 *
 * In some cases, it makes sense to set up a global root using {@link setRoot},
 * but some elements might be rendered outside even that, such as directly under
 * the body. For cases like this, {@link globalSelector} accepts an optional
 * root element to use as the root of the queries of the page object it
 * generates.
 *
 * @param {string} selector the selector
 * @param {Element} rootElement the root element under which to query the
 * selector.
 * @param {Function<PageObject>} Class optional {@link PageObject} subclass that
 * can be used to extend the functionality of this page object
 *
 * @returns {PageObject} a {@link PageObject} or {@link PageObject} subclass
 * instance
 */
export default function globalSelector<T extends PageObject>(
  selector: string,
  rootElement: Element,
  Class?: PageObjectClass<T>
): T;

/**
 * Define a {@link PageObject} with a global scope, i.e. not scoped by its
 * parent page object. Useful for cases like popovers and dropdowns, where the
 * UI control is logically inside a given component, but all or part of it
 * renders elsewhere in the DOM, such as directly under the body.
 * {@link globalSelector} accepts a selector and optional custom class like
 * {@link selector()}, but the queries of the page objects it generates will be
 * executed from the root (`document.body` or whatever was passed to
 * {@link setRoot}) rather than the parent page object's elements.
 *
 * In some cases, it makes sense to set up a global root using {@link setRoot},
 * but some elements might be rendered outside even that, such as directly under
 * the body. For cases like this, {@link globalSelector} accepts an optional
 * root element to use as the root of the queries of the page object it
 * generates.
 *
 * @param {string} selector the selector
 * @param {Function<PageObject>} Class optional {@link PageObject} subclass that
 * can be used to extend the functionality of this page object
 *
 * @returns {PageObject} a {@link PageObject} or {@link PageObject} subclass
 * instance
 *
 * @example
 *
 * import { PageObject, selector, globalSelector } from 'fractal-page-object';
 *
 * const testContainer = document.querySelector('#test-container');
 * setRoot(testContainer);
 *
 * class Page extends PageObject {
 *   listItems = selector('.list-item', class extends PageObject {
 *     popover = globalSelector('.popover', class extends PageObject {
 *       icon = selector('.icon');
 *     });
 *   });
 * }
 * let page = new Page();
 * page.listItems[0]; // testContainer.querySelectorAll('.listItems')[0]
 * page.listItems[0].popover; // testContainer.querySelectorAll('.popover')
 * page.listItems[0].popover.icon; // testContainer.querySelectorAll('.popover .icon')
 *
 * @example
 *
 * import { setRoot, PageObject, selector, globalSelector } from 'fractal-page-object';
 *
 * const testContainer = document.querySelector('#test-container');
 * setRoot(testContainer);
 *
 * class Page extends PageObject {
 *   listItems = selector('.list-item', class extends PageObject {
 *     popover = globalSelector('.popover', document.body, class extends PageObject {
 *       icon = selector('.icon');
 *     });
 *   });
 * }
 * let page = new Page();
 * page.listItems[0]; // testContainer.querySelectorAll('.listItems')[0]
 * page.listItems[0].popover; // document.body.querySelectorAll('.popover')
 * page.listItems[0].popover.icon; // document.body.querySelectorAll('.popover .icon')
 */ export default function globalSelector<T extends PageObject>(
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
