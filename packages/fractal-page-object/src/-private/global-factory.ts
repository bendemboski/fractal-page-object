import type { ElementLike, PageObjectConstructor } from './types';
import PageObject from '../page-object';
import Factory from './factory';

/**
 * A factory for creating {@link PageObject}s in a global scope, i.e. whose queries
 * are not scoped to their parent. The factory has an optional rootElement argument
 * that specifies the element under which to scope queries. If not specified, it will
 * default to the global root set via {@link setRoot}.
 */
export default class GlobalPageObjectFactory<
  ElementType extends ElementLike,
  T extends PageObject<ElementType>,
> extends Factory<ElementType, T> {
  /**
   * @param selector the selector for page objects created from this factory
   * @param rootElement the element that will be used to scope the page object's
   * selector query, defaulting to the global root if not specified
   * @param Class the class to use when creating page objects. It must be a
   * subclass of {@link PageObject}. If not supplied, {@link PageObject} will be
   * used.
   */
  constructor(
    selector: string,
    private rootElement?: ElementLike,
    Class?: PageObjectConstructor<ElementType, T>,
  ) {
    super(selector, Class);
  }

  /**
   * Create a {@link PageObject}
   *
   * @param parent the {@link PageObject} to set as the new page object's parent
   * @returns the new page object
   */
  create(): PageObject<ElementType> {
    return super.create(this.rootElement);
  }
}
