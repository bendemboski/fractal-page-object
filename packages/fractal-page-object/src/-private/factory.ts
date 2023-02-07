import type { PageObjectConstructor } from './types';
import PageObject from '../page-object';

/**
 * A factory for creating {@link PageObject}s. The factory is constructed with a
 * selector and an optional class that must be a {@link PageObject} subclass.
 * The {@link PageObjectFactor#create} method instantiates page objects using
 * the data provided to the factoryt.
 */
export default class PageObjectFactory<
  ElementType extends Element,
  T extends PageObject<ElementType>
> {
  /**
   * @param selector the selector for page objects created from this factory
   * @param Class the class to use when creating page objects. It must be a
   * subclass of {@link PageObject}. If not supplied, {@link PageObject} will be
   * used.
   */
  constructor(
    private selector: string,
    private Class?: PageObjectConstructor<ElementType, T>
  ) {}

  /**
   * Create a {@link PageObject}
   *
   * @param parent the {@link PageObject} to set as the new page object's parent
   * @returns the new page object
   */
  create(parent?: PageObject | Element): PageObject<ElementType> {
    let Class =
      this.Class ||
      (PageObject as PageObjectConstructor<
        ElementType,
        PageObject<ElementType>
      >);
    return new Class(this.selector, parent);
  }
}
