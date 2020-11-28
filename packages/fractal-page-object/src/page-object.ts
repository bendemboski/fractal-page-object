import ArrayStub from './-private/array-stub';
import { getRoot } from './-private/root';
import DOMQuery from './-private/dom-query';
import createProxy from './-private/create-proxy';
import { DOM_QUERY, CLONE_WITH_INDEX } from './-private/types';
import type { PageObjectClass } from './-private/types';

/**
 * A page object, representing a DOM query that resolves to 0 or more
 * {@link Element}s.
 *
 * {@link PageObject}s exist in a tree where each {@link PageObject}'s elements
 * are descendants of its parent's elements. There is a root {@link PageObject}
 * whose query is relative to the single global root element (@see
 * {@link setRoot}) and then each non-root {@link PageObject} has a selector
 * and optional index (making them "indexed page objects") that define its
 * elements relative to its parent's elements.
 *
 * As long as no page objects are indexed, each {@link PageObject} conceptually
 * appends its selector to its parent's selector, in effect making its matching
 * elements
 *
 * ```javascript
 * rootElement.querySelectorAll(`${this.parent.selector} ${this.selector}`);
 * ```
 *
 * Indexed page objects restrict their matching elements to only the one
 * element at their index within their full query results (or no elements if
 * there is no element at that index). That in effect "resets" the root element
 * for its descendants, so its children execute queries relative to its
 * matching element (if it has one) and so on.
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
 * @example
 *
 * import { PageObject, selector } from 'fractal-page-object';
 *
 * document.body.innerHTML = '<div id="div1"></div><div id="div2"></div>'
 * class Page extends PageObject {
 *   divs = selector('div')
 * }
 * let page = new Page();
 *
 * page.divs.elements; // === Array.from(document.querySelectorAll('div'))
 * page.divs.length; // === 2
 * page.divs[0]; // PageObject wrapping first div
 * page.divs.slice(0, 2); // Array of two PageObjects wrapping both divs
 * page.divs.map(d => d.element.id) // ['div1', 'div2']
 * page.divs[1].element.id; // 'div2'
 * page.divs[2].element // null
 */
export default class PageObject extends ArrayStub {
  /**
   * This page object's single matching DOM element -- the first DOM element
   * matching this page object's query if this page object does not have an
   * index, or the `index`th matching DOM element if it does have an index
   * specified.
   */
  get element(): Element | null {
    return this[DOM_QUERY].query();
  }

  /**
   * This page object's list of matching DOM elements. If this page object has
   * an index, this property will always have a length of 0 or 1.
   */
  get elements() {
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
      parentQuery = new DOMQuery(this.parent, '');
    } else {
      parentQuery = new DOMQuery(getRoot(), '');
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
    // We have to be careful about how we treat the index. If this page object
    // already has an index, then it only matches 0 elements or 1 element, so
    // cloning it with a new index can only possibly match an element if that
    // new index is 0. For example, suppose `pageObject` matched two DOM
    // elements. Then `pageObject[0]` would match only the first DOM element,
    // and `pageObject[0][0]` would match that same DOM element, while
    // `pageObject[0][1]` wouldn't match any DOM element. So we need to factor
    // in this page object's index when determining what index in the full query
    // result set the passed-in index is actually referring to.
    let resolvedIndex;
    if (this.index === null) {
      // No index, so the index stays as provided
      resolvedIndex = index;
    } else {
      // We have an index. So if the provided index is 0, the clone should match
      // the same element as this page object, and should get the same index. If
      // the provided index is anything else, it can never match any DOM elements,
      // so we'll give the clone an index of -1 so it never matches.
      if (index === 0) {
        resolvedIndex = this.index;
      } else {
        resolvedIndex = -1;
      }
    }
    let Class = this.constructor as PageObjectClass<PageObject>;
    return new Class(
      this.selector,
      this.parent,
      resolvedIndex,
      this.rootElement
    );
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
   * all elements that are descendants of the single global root element, i.e.
   *
   * ```javascript
   * rootElement.querySelectorAll(selector)
   * ```
   *
   * @param selector the selector to use for this page object's query
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
   * @param rootElement an optional element that will be used as the root of
   * this element's query, overriding the parent and/or global root
   *
   * @private
   */
  constructor(
    selector: string,
    parent?: PageObject | Element | null,
    index?: number | null,
    rootElement?: Element | null
  );

  constructor(
    private selector: string = '',
    private parent: PageObject | Element | null = null,
    private index: number | null = null,
    private rootElement: Element | null = null
  ) {
    super();
    return createProxy(this);
  }
}
