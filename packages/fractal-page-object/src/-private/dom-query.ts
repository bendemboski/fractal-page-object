/**
 * A class that can execute selector-based DOM queries, with supporting for
 * intermediate indexing.
 */
export default class DOMQuery {
  /**
   * @param root the root element from which to query
   * @param selector the selector to query
   */
  constructor(
    public readonly root: Element | null,
    public readonly selector: string
  ) {}

  /**
   * Query the first matching element
   */
  query(): Element | null {
    if (!this.root) {
      return null;
    }

    if (this.selector) {
      return this.root.querySelector(this.selector);
    } else {
      return this.root;
    }
  }

  /**
   * Query all matching elements
   */
  queryAll(): Element[] {
    if (!this.root) {
      return [];
    }

    if (this.selector) {
      return Array.from(this.root.querySelectorAll(this.selector));
    } else {
      return [this.root];
    }
  }

  /**
   * Create a child {@link DOMQuery} from a selector and an optional index.
   * {@link DOMQuery} objects created using this method are not guaranteed to be
   * lazy -- if an index is specified, the query will be executed immediately.
   *
   * @param selector selector to query
   * @param index target index of the {@link Element} in the query results, or
   * null if this isn't an index query
   */
  createChild(selector: string, index: number | null) {
    // Create a DOMQuery just using the selector, and ignoring the index, which
    // is accomplished by appending the new selector to ours and keeping the
    // same root.
    let child = new DOMQuery(this.root, `${this.selector} ${selector}`.trim());
    if (index !== null) {
      // We have an index, so we have to query all matching elements to find the
      // one we are targeting, and set that as our root with no selector.
      let element = child.queryAll()[index] || null;
      return new DOMQuery(element, '');
    } else {
      // No index, so nothing extra to do
      return child;
    }
  }
}
