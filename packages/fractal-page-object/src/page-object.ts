import ArrayStub from './-private/array-stub';
import createProxy from './-private/create-proxy';
import type DOMQuery from './-private/dom-query';
import { getDOMQuery, setPageObjectState } from './-private/page-object-state';
import type { ElementLike, GenericPageObject } from './-private/types';
import {
  type IDOMElementDescriptor,
  IS_DESCRIPTOR,
  registerDescriptorData,
} from 'dom-element-descriptors';

/**
 * Descriptor data implemented by a {@link DOMQuery} -- used by
 * {@link PageObject} to "implement" {@link IDOMElementDescriptor}
 */
class DOMQueryDescriptorData {
  constructor(private getQuery: () => DOMQuery) {}

  get element(): Element | null {
    return this.getQuery().query();
  }

  get elements(): Element[] {
    return this.getQuery().queryAll();
  }

  get description(): string {
    return this.getQuery().selectorArray.toString();
  }
}

/**
 * This class implements all the basic page object functionality, and all page
 * objects must inherit from it. It can host {@link selector} and
 * {@link globalSelector} fields, and will properly instantiate them as nested
 * {@link PageObject}s when accessed. Each page object represents a DOM query
 * that matches zero or more {@link Element}s (or subclasses of {@link Element}
 * -- see {@link ElementType}).
 *
 * {@link PageObject}s exist in a tree where each {@link PageObject}'s elements
 * are descendants of its parent's elements. The root of the tree is a top-level
 * {@link PageObject} created using `new PageObject()`, that by default will
 * match the root element (the body element or whatever was set as the root
 * using {@link setRoot}). It can also be constructed with a selector argument,
 * `new PageObject(selector)`, in which case its query will be a selector query
 * starting from the root element. Then each non-root {@link PageObject} has a
 * selector and optional index that define its elements relative to its parent's
 * elements.
 *
 * As long as no page objects have an index, each {@link PageObject}
 * conceptually appends its selector to its parent's selector, in effect making
 * its matching elements
 *
 * ```javascript
 * rootElement.querySelectorAll(`${this.parent.selector} ${this.selector}`);
 * ```
 *
 * Page objects that do have an index ("indexed page objects") restrict their
 * matching elements to only the one element at their index within their full
 * query results (or no elements if there is no element at that index). That in
 * effect "resets" the root element for its descendants, so its children execute
 * queries relative to its matching element (if it has one) and so on.
 *
 * {@link PageObject}s are lazy, meaning that their query is not evaluated when
 * they are constructed, but is evaluated and re-evaluated each time a property
 * that depends on it is accessed.
 *
 * {@link PageObject}s expose an API for interacting with their matching
 * elements that comprises {@link PageObject#element},
 * {@link PageObject#elements}, and an {@link Array} API that exposes the page
 * object's matching {@link ElementType}s wrapped in indexed
 * {@link PageObject}s. The index operator will return an indexed
 * {@link PageObject} that may or may not match an element (similar to how you
 * can index off the end of a native array and get `undefined`), while various
 * array iteration methods like {@link PageObject#map} generate a range of
 * {@link PageObject}s that reflect only the indices that actually match an
 * element.
 *
 * Descendant {@link PageObject}s are defined by subclassing {@link PageObject}
 * and using the {@link selector} factory function to initialize class fields.
 *
 * When creating a top-level {@link PageObject} directly using `new`, its query
 * will match the root element (the body element or whatever was )
 *
 * @param selector the selector to use for this page object's query
 * @param parent the element or page object to use as the root of the page
 * object's query, defaulting to the global root element
 * @param index an index to narrow the query to an element at a specific index
 * within the query results
 *
 * @example
 *
 * import { PageObject, selector, setRoot } from 'fractal-page-object';
 *
 * class Page extends PageObject {
 *   list = selector('.list');
 * }
 *
 * setRoot(rootElement);
 *
 * // rootElement.querySelectorAll('.list')
 * new Page().list.elements;
 * // rootElement.querySelectorAll('.container .list')
 * new Page('.container').list.elements;
 * // rootElement.querySelectorAll('.container')[0].querySelectorAll('.list')
 * new Page('.container', null, 0).list.elements;
 * // document.body.querySelectorAll('.list');
 * new Page('', document.body).list.elements;
 * // document.body.querySelectorAll('.container .list');
 * new Page('.container', document.body).list.elements;
 * // document.body.querySelectorAll('.container')[1].querySelectorAll('.list');
 * new Page('.container', document.body, 1).list.elements;
 */
export default class PageObject<ElementType extends Element = Element>
  extends ArrayStub<ElementType>
  implements IDOMElementDescriptor
{
  readonly [IS_DESCRIPTOR] = true;

  /**
   * This page object's single matching DOM element -- the first DOM element
   * matching this page object's query if this page object does not have an
   * index, or the `index`th matching DOM element if it does have an index
   * specified.
   *
   * @type {ElementType | null}
   */
  get element(): ElementType | null {
    return getDOMQuery(this).query() as ElementType | null;
  }

  /**
   * This page object's list of matching DOM elements. If this page object has
   * an index, this property will always have a length of 0 or 1.
   *
   * @type {ElementType[]}
   */
  get elements(): ElementType[] {
    return getDOMQuery(this).queryAll() as ElementType[];
  }

  /**
   * Create a root page object whose query matches exactly the single global
   * root element
   *
   * @see {@link setRoot}
   */
  constructor();

  /**
   * Create a root page object whose query is generated by using a selector to match
   * all elements that are descendants of the global root element
   *
   * @param {string} selector the selector to use for this page object's query
   *
   * @see {@link setRoot}
   */
  constructor(selector: string);

  /**
   * @param selector the selector to use for this page object's query
   * @param parent this page object's parent, or null if this is a root page
   * object
   * @param index an optional index, making this page object only describe a
   * single element (or none) rather than a list of elements
   *
   * @private
   */
  constructor(
    selector: string,
    parent?: GenericPageObject | ElementLike | null,
    index?: number | null,
  );

  constructor(
    selector = '',
    parent: GenericPageObject | ElementLike | null = null,
    index: number | null = null,
  ) {
    super();

    const proxy = createProxy(this);

    setPageObjectState(this, { selector, parent, index });
    setPageObjectState(proxy, { selector, parent, index });

    registerDescriptorData(
      proxy,
      new DOMQueryDescriptorData(() => getDOMQuery(proxy)),
    );

    return proxy;
  }
}
