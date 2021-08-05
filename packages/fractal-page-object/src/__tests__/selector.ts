import { describe, test, expect } from '@jest/globals';
import { selector, PageObject } from '..';

describe('selector()', () => {
  test('it requires a selector and the class must be a PageObject subclass', () => {
    expect(() => selector('')).toThrow();
    // @ts-expect-error violate types to make sure validation throws
    expect(() => selector('div', class {})).toThrow();
  });

  test('it works without a class', () => {
    document.body.innerHTML = '<div></div>';
    let div = document.body.children[0];

    class Page extends PageObject {
      div = selector('div');
    }
    let page = new Page();

    expect(page.div.element).toEqual(div);
    expect(page.div[0].element).toEqual(div);
  });

  test('it works with a class', () => {
    document.body.innerHTML = '<div id="div1"></div>';
    let div = document.body.children[0];

    class Page extends PageObject {
      // prettier-ignore
      div = selector('div', class extends PageObject {
        get elementId() {
          return this.element?.id;
        }
      });
    }
    let page = new Page();

    expect(page.div.element).toEqual(div);
    expect(page.div.elementId).toEqual('div1');
    expect(page.div[0].element).toEqual(div);
    expect(page.div[0].elementId).toEqual('div1');
  });
});
