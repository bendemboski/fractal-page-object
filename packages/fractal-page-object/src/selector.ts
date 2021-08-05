import PageObjectFactory from './-private/factory';
import PageObject from './page-object';
import type { PageObjectClass } from './-private/types';
import { validateSelectorArguments } from './-private/helpers';

/**
 * Define a child PageObject. It can optionally be supplied with a
 * {@link PageObject} subclass definition to allow customizing functionality on
 * the page object, such as defining (grand)child page objects, or other helpful
 * properties and functions.
 *
 * @param {string} selector the selector relative to the parent node
 * @param {Function<PageObject>} [Class] optional {@link PageObject} subclass that
 * can be used to extend the functionality of this page object
 *
 * @returns {PageObject} a {@link PageObject} or {@link PageObject} subclass
 * instance
 *
 * @example
 *
 * import { PageObject, selector } from 'fractal-page-object';
 *
 * class Page extends PageObject {
 *   list = selector('.list', class extends PageObject {
 *     items = selector('li');
 *   });
 * }
 * let page = new Page();
 * page.list.elements; // document.body.querySelectorAll('.list')
 * page.list.items.elements; // document.body.querySelectorAll('.list li')
 */
export default function selector<T extends PageObject>(
  selector: string,
  Class?: PageObjectClass<T>
): T {
  validateSelectorArguments(selector, Class);

  // Return a factory, but typed as the class it will instantiate since the
  // proxy will do the intantiation anytime a property containing a factory is
  // accessed
  return new PageObjectFactory(selector, Class) as unknown as T;
}
