import { describe, afterEach, test, expect } from '@jest/globals';
import { PageObject, selector, text, assertExists } from '../index';
import { resetRoot } from '../-private/root';

describe('PageObject utils', () => {
  afterEach(() => resetRoot());

  describe('text', () => {
    test('element exists', () => {
      document.body.innerHTML = '<div>boop</div>';

      class Page extends PageObject {}
      let page = new Page('div');

      expect(text(page)).toEqual('boop');
    });

    test('element missing', () => {
      document.body.innerHTML = '<div>boop</div>';

      class Page extends PageObject {}
      let page = new Page('button');

      expect(text(page)).toEqual(undefined);
    });
  });

  describe('assertExists', () => {
    test('element exists', () => {
      document.body.innerHTML = '<div>boop</div>';

      class Page extends PageObject {}
      let page = new Page('div');

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
      let page = new Page('div');

      expect(() => {
        assertExists('test', page);
      }).toThrow(/Tried selector `div`/);
    });

    test('selector shown is deep', () => {
      document.body.innerHTML = '';

      class Page extends PageObject {
        nested = selector('button');
      }
      let page = new Page('div');

      expect(() => {
        assertExists('test', page.nested);
      }).toThrow(/Tried selector `div button`/);
    });
  });
});
