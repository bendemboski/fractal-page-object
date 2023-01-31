import ArrayStub from './-private/array-stub';
import { getRoot } from './-private/root';
import DOMQuery from './-private/dom-query';
import createProxy from './-private/create-proxy';
import { DOM_QUERY, CLONE_WITH_INDEX } from './-private/types';
import type { PageObjectConstructor } from './-private/types';

/**
 * This class implements all the basic page object functionality, and all page
 * objects must inherit from it. It can host {@link selector} and
 * {@link globalSelector} fields, and will properly instantiate them as nested
 * {@link PageObject}s when accessed. Each page object represents a DOM query
 * that matches zero or more {@link Element}s.
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
 * object's matching {@link Element}s wrapped in indexed {@link PageObject}s.
 * The index operator will return an indexed {@link PageObject} that may or may
 * not match an element (similar to how you can index off the end of a native
 * array and get `undefined`), while various array iteration methods like
 * {@link PageObject#map} generate a range of {@link PageObject}s that reflect
 * only the indices that actually match an element.
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
export default class PageObject<K extends Element = Element> extends ArrayStub {
  /**
   * This page object's single matching DOM element -- the first DOM element
   * matching this page object's query if this page object does not have an
   * index, or the `index`th matching DOM element if it does have an index
   * specified.
   *
   * @type {Element | null}
   */
  get element(): K | null {
    return this[DOM_QUERY].query() as unknown as K;
  }

  /**
   * This page object's list of matching DOM elements. If this page object has
   * an index, this property will always have a length of 0 or 1.
   *
   * @type {Element[]}
   */
  get elements(): Element[] {
    return this[DOM_QUERY].queryAll();
  }

  /**
   * A {@link DOMQuery} object for querying this page object's matching DOM
   * elements
   *
   * @private
   */
  get [DOM_QUERY](): DOMQuery {
    let parentQuery;
    if (this.parent instanceof PageObject) {
      parentQuery = this.parent[DOM_QUERY];
    } else if (this.parent instanceof Element) {
      parentQuery = new DOMQuery(this.parent);
    } else {
      parentQuery = new DOMQuery(getRoot());
    }
    return parentQuery.createChild(this.selector, this.index);
  }

  /**
   * Create a clone of this {@link PageObject}, but with an index specified. If
   * called on an instance of a subclass of {@link PageObject}, the clone will
   * be an instance of that subclass.
   *
   * @param index the index
   *
   * @returns a clone of this page object, but only selecting the DOM element in
   * the matching elements at the given index
   *
   * @private
   */
  [CLONE_WITH_INDEX](index: number): PageObject {
    let Class = this.constructor as PageObjectConstructor<PageObject>;
    return new Class('', this, index);
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
    parent?: PageObject | Element | null,
    index?: number | null
  );

  constructor(
    private selector: string = '',
    private parent: PageObject | Element | null = null,
    private index: number | null = null
  ) {
    super();
    return createProxy<K>(this);
  }
}
