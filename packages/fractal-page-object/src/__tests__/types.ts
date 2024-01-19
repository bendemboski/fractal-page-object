import { describe, test, expect } from 'vitest';
import { ElementLike, isElementLike } from '../index';

describe('types', () => {
  describe('isElementLike', () => {
    test('works', () => {
      expect(isElementLike({})).toEqual(false);
      expect(isElementLike(null)).toEqual(false);
      expect(isElementLike(document)).toEqual(false);
      expect(isElementLike(document.createDocumentFragment())).toEqual(true);
      expect(isElementLike(document.createElement('div'))).toEqual(true);
    });

    test('type narrows', () => {
      const doThing = (el: ElementLike) => el;
      let obj: unknown = document.createElement('div');

      doThing(
        // @ts-expect-error should produce error
        obj
      );

      if (isElementLike(obj)) {
        doThing(obj);
      }
      expect(true).toEqual(true);
    });
  });
});
