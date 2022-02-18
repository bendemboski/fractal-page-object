import { describe, test, expect } from '@jest/globals';
import { selector, PageObject } from '..';

describe('selector()', () => {
  test('it requires a valid selector and the class must be a PageObject subclass', () => {
    expect(() => selector('')).toThrow();
    expect(() => selector('  ')).toThrow();
    expect(() => selector('$,')).toThrow();
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
      div = selector(
        'div',
        class extends PageObject {
          get elementId() {
            return this.element?.id;
          }
        }
      );
    }
    let page = new Page();

    expect(page.div.element).toEqual(div);
    expect(page.div.elementId).toEqual('div1');
    expect(page.div[0].element).toEqual(div);
    expect(page.div[0].elementId).toEqual('div1');
  });

  test('it can be defined as a reusable static property', () => {
    document.body.innerHTML = [
      '<div id="pane1">',
      '  <form>',
      '    <input id="input1"/>',
      '  </form>',
      '</div>',
      '<div id="pane2">',
      '  <form>',
      '    <input id="input2"/>',
      '  </form>',
      '</div>',
    ].join('');

    class Form extends PageObject {
      input = selector('input');
      static selector = selector('form', Form);
    }

    class Pane1 extends PageObject {
      form = Form.selector;
    }

    class Pane2 extends PageObject {
      form = Form.selector;
    }

    class Page extends PageObject {
      pane1 = selector('#pane1', Pane1);
      pane2 = selector('#pane2', Pane2);
    }
    let page = new Page();

    expect(page.pane1.form.input.element?.id).toEqual('input1');
    expect(page.pane2.form.input.element?.id).toEqual('input2');
  });

  test('it works with a scoped selector', () => {
    document.body.innerHTML = '<div><div></div></div>';
    let div = document.body.children[0];

    class Page extends PageObject {
      div = selector('> div');
    }
    let page = new Page();

    expect(page.div.length).toEqual(1);
    expect(page.div.element).toEqual(div);
    expect(page.div[0].element).toEqual(div);
  });
});
