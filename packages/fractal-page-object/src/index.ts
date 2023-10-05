export { setRoot } from './-private/root';
export {
  type ElementLike,
  isElementLike,
  type PageObjectConstructor,
  type WithElement,
} from './-private/types';

export { default as PageObject } from './page-object';

export { default as selector } from './selector';
export { default as globalSelector } from './global-selector';

export { assertExists, getDescription } from './utils';
