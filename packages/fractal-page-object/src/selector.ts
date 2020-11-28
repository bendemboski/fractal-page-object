import PageObjectFactory from './-private/factory';
import PageObject from './page-object';
import type { PageObjectClass } from './-private/types';
import { validateSelectorArguments } from './-private/helpers';

/**
 * Define a child PageObject
 *
 * @param selector the selector relative to the parent node
 * @param Class optional {@link PageObject} subclass that can be used to extend
 * the functionality of this page object
 */
export default function selector<T extends PageObject>(
  selector: string,
  Class?: PageObjectClass<T>
): T {
  validateSelectorArguments(selector, Class);

  // Return a factory, but typed as the class it will instantiate since the
  // proxy will do the intantiation anytime a property containing a factory is
  // accessed
  return (new PageObjectFactory(selector, Class) as unknown) as T;
}
