import safeSelector from './safe-selector';
import { ElementLike } from './types';

/**
 * A helper to run `querySelector()`, trying first with the selector given, and
 * then if that errors, with the result of passing it through
 * {@link safeSelector}.
 */
function querySelector(root: ElementLike, selector: string): Element | null {
  try {
    return root.querySelector(selector);
  } catch (e) {
    return root.querySelector(safeSelector(selector));
  }
}

/**
 * A helper to run `querySelectorAll()`, trying first with the selector given,
 * and then if that errors, with the result of passing it through
 * {@link safeSelector}.
 */
function querySelectorAll(
  root: ElementLike,
  selector: string,
): NodeListOf<Element> {
  try {
    return root.querySelectorAll(selector);
  } catch (e) {
    return root.querySelectorAll(safeSelector(selector));
  }
}

/**
 * An element of a {@link SelectorArray}, comprising a selector and optional
 * index. This is to support a DOM query/selector language that allows indexing.
 */
interface SelectorFragment {
  selector: string;
  index?: number;
}

/**
 * A class that represents a flexible selector, allowing intermediate indices.
 * It's an array of {@link SelectorFragment}s that represents a set of query and
 * index instructions allowing DOM queries that include indexing.
 */
class SelectorArray extends Array<SelectorFragment> {
  /**
   * Create a new selector array that extends this one with either another
   * selector, or an indexing operation.
   *
   * @param val the selector or index with which to extend this selector array
   */
  extend(val: string | number) {
    let extended = new SelectorArray(...this);

    let prevFragment = extended[extended.length - 1];

    if (typeof val === 'string') {
      if (prevFragment && prevFragment.index === undefined) {
        // We have a previous fragment without an index, so we can combine this
        // selector with the previous fragment's
        prevFragment.selector = `${prevFragment.selector} ${val}`;
      } else {
        // No previous fragment, or previous fragment already has an index, so
        // we have to add a new fragment
        extended.push({ selector: val });
      }
    } else {
      if (prevFragment && prevFragment.index === undefined) {
        // We have a previous fragment without an index, so we can add this
        // index to it
        prevFragment.index = val;
      } else {
        // No previous fragment, or previous fragment already has an index, so
        // we need to add a new fragment with an empty selector and this index
        extended.push({ selector: '', index: val });
      }
    }
    return extended;
  }

  /**
   * A string representation of this selector array, e.g. `div span[1] strong`
   */
  toString() {
    let str = '';
    for (let { selector, index } of this) {
      str = `${str} ${selector}`.trim();
      if (index !== undefined) {
        str = `${str}[${index}]`;
      }
    }
    return str;
  }
}

/**
 * A class that can execute selector-based DOM queries, with supporting for
 * intermediate indexing.
 */
export default class DOMQuery {
  /**
   * @param root the root element from which to query
   * @param selectorArray the selector array describing the query to execute
   */
  constructor(
    public readonly root: ElementLike | null,
    public readonly selectorArray: SelectorArray = new SelectorArray(),
  ) {}

  /**
   * Query the first matching element
   */
  query(): ElementLike | null {
    let el = this.root;
    for (let { selector, index } of this.selectorArray) {
      if (!el) {
        break;
      }

      if (index !== undefined) {
        if (selector) {
          // Selector and index, so query all and index into result set
          el = querySelectorAll(el, selector)[index];
        } else {
          // Only index, so index into the result set, which is just the current
          // element
          el = [el][index];
        }
      } else {
        // Only a selector
        el = querySelector(el, selector);
      }
    }
    return el || null;
  }

  /**
   * Query all matching elements
   */
  queryAll(): ElementLike[] {
    if (!this.root) {
      return [];
    }

    let matches = [this.root];
    for (let { selector, index } of this.selectorArray) {
      if (matches.length === 0) {
        break;
      }

      if (index !== undefined && index !== null) {
        let el;
        if (selector) {
          // Selector and index, so query all and index into the result set
          el = querySelectorAll(matches[0], selector)[index];
        } else {
          // Only index, so index into the result set, which is just the current
          // element
          el = matches[index];
        }
        // Convert to singleton array
        matches = el ? [el] : [];
      } else {
        // Only a selector, so query for result set and covert to array
        matches = Array.from(querySelectorAll(matches[0], selector));
      }
    }
    return matches;
  }

  /**
   * Create a child {@link DOMQuery} from a selector and an optional index.
   *
   * @param selector selector to query
   * @param index target index of the {@link ElementLike} in the query results,
   * or null if this isn't an index query
   */
  createChild(selector: string, index: number | null): DOMQuery {
    let child = this.selectorArray;
    if (selector) {
      child = child.extend(selector);
    }
    if (index !== null) {
      child = child.extend(index);
    }
    return new DOMQuery(this.root, child);
  }
}
