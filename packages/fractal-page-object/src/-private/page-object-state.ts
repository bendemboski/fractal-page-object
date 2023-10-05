import DOMQuery from './dom-query';
import { getRoot } from './root';
import {
  isElementLike,
  type ElementLike,
  type GenericPageObject,
} from './types';

/**
 * This interface describes the internal/private state of a {@link PageObject}.
 * We store it in a weak map rather than in properties on the object to avoid
 * name collisions with properties that consumers might want to define on
 * {@link PageObject} sub-classes.
 */
interface IPageObjectState {
  selector: string;
  parent: GenericPageObject | ElementLike | null;
  index: number | null;
}

/**
 * Our weak map of page objects to their state
 */
const pageObjectState = new WeakMap<GenericPageObject, IPageObjectState>();

/**
 * Set a {@link PageObject}'s state
 */
export function setPageObjectState(
  pageObject: GenericPageObject,
  state: IPageObjectState
) {
  pageObjectState.set(pageObject, state);
}

/**
 * Get a DOMQuery for a {@link PageObject}, using its state
 */
export function getDOMQuery(pageObject: GenericPageObject): DOMQuery {
  let state = pageObjectState.get(pageObject);
  if (!state) {
    throw new Error(
      'Page object state not found, this is probably a bug in fractal-page-object'
    );
  }
  let { parent, selector, index } = state;

  let parentQuery;
  if (isElementLike(parent)) {
    parentQuery = new DOMQuery(parent);
  } else if (parent) {
    parentQuery = getDOMQuery(parent);
  } else {
    parentQuery = new DOMQuery(getRoot());
  }
  return parentQuery.createChild(selector, index);
}
