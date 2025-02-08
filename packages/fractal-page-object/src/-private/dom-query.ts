import safeSelector from './safe-selector';
import type { ElementLike } from './types';

/**
 * A helper to run `querySelector()`, trying first with the selector given, and
 * then if that errors, with the result of passing it through
 * {@link safeSelector}.
 */
function querySelector(root: ElementLike, selector: string): Element | null {
  try {
    return root.querySelector(selector);
  } catch {
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
  } catch {
    return root.querySelectorAll(safeSelector(selector));
  }
}

/**
 * Given a root {@link ElementLike}, run the query described by a
 * {@link SelectorFragment}, and return the result
 */
function query(root: ElementLike, fragment: SelectorFragment): Element | null {
  const { selector, index } = fragment;
  if (index !== undefined) {
    if (selector) {
      // Selector and index, so query all and index into result set
      return querySelectorAll(root, selector)[index] || null;
    } else {
      // Only index, so since we're just acting on one element, the only index
      // that could possibly match anything is 0.
      if (index === 0) {
        // We never match DocumentFragments
        return root instanceof DocumentFragment ? null : root;
      } else {
        return null;
      }
    }
  } else {
    // Only a selector
    return querySelector(root, selector);
  }
}

/**
 * Given a root {@link ElementLike} array, run the query described by a
 * {@link SelectorFragment}, and return the result
 */
function queryAll(root: ElementLike[], fragment: SelectorFragment) {
  if (root.length === 0) {
    return [];
  }

  const { selector, index } = fragment;

  if (index !== undefined) {
    if (selector) {
      // Selector and index, so query all and index into the result set
      const results = querySelectorAll(root[0], selector);
      if (index < results.length) {
        return [results[index]];
      }
    } else {
      // Only index, so index into the root array
      if (index < root.length) {
        // We never match DocumentFragments
        const result = root[index];
        return result instanceof DocumentFragment ? [] : [result];
      }
    }
    return [];
  } else {
    // Only a selector, so query for result set and covert to array
    return Array.from(querySelectorAll(root[0], selector));
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
    const extended = new SelectorArray(...this);

    const prevFragment = extended[extended.length - 1];

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
    for (const { selector, index } of this) {
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
  query(): Element | null {
    if (!this.root) {
      return null;
    }

    const [first, ...rest] = this.selectorArray;

    if (!first) {
      // No selector info, so return the root unless it's a DocumentFragment
      return this.root instanceof DocumentFragment ? null : this.root;
    }

    let el = query(this.root, this.selectorArray[0]);
    for (const fragment of rest) {
      if (!el) {
        break;
      }
      el = query(el, fragment);
    }
    return el;
  }

  /**
   * Query all matching elements
   */
  queryAll(): Element[] {
    if (!this.root) {
      return [];
    }

    const [first, ...rest] = this.selectorArray;

    if (!first) {
      // No selector info, so return the root unless it's a DocumentFragment
      return this.root instanceof DocumentFragment ? [] : [this.root];
    }

    let matches = queryAll([this.root], first);
    for (const fragment of rest) {
      if (matches.length === 0) {
        break;
      }
      matches = queryAll(matches, fragment);
    }
    return matches;
  }

  /**
   * Create a child {@link DOMQuery} from a selector and an optional index.
   *
   * @param selector selector to query
   * @param index target index of the {@link Element} in the query results, or
   * null if this isn't an index query
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
