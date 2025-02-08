import { describe, afterEach, test, expect } from 'vitest';
import {
  PageObject,
  selector,
  assertExists,
  getDescription,
} from '../fractal-page-object';
import { resetRoot } from '../-private/root';

describe('utils', () => {
  afterEach(() => resetRoot());

  describe('assertExists', () => {
    test('element exists', () => {
      document.body.innerHTML = '<div>boop</div>';

      class Page extends PageObject {}
      const page = new Page('div');

      try {
        assertExists('test', page);
      } catch {
        expect('This should not error').toEqual(false);
      }

      expect(true).toEqual(true);
    });

    test('element missing', () => {
      document.body.innerHTML = '';

      class Page extends PageObject {}
      const page = new Page('div');

      expect(() => {
        assertExists('test', page);
      }).toThrow(/Tried selector `div`/);
    });

    test('selector shown is deep', () => {
      document.body.innerHTML = '';

      class Page extends PageObject {
        nested = selector('button');
      }
      const page = new Page('div');

      expect(() => {
        assertExists('test', page.nested);
      }).toThrow(/Tried selector `div button`/);
    });
  });

  describe('getDescription', () => {
    test('it works', () => {
      class Page extends PageObject {
        thing = selector(
          '.thing',
          class extends PageObject {
            subthing = selector('.subthing');
          },
        );
      }
      const page = new Page();

      expect(getDescription(page.thing)).toEqual('.thing');
      expect(getDescription(page.thing.subthing)).toEqual('.thing .subthing');
      expect(getDescription(page.thing[1].subthing[0])).toEqual(
        '.thing[1] .subthing[0]',
      );
    });

    test('it throws when passed a non-page-object', () => {
      expect(() => getDescription({} as PageObject)).toThrow();
    });
  });
});
