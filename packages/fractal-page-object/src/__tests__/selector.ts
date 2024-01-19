import { describe, test, expect } from 'vitest';
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
        },
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

  test('it works with an Element sub-type', () => {
    document.body.innerHTML = '<input value="value1">';

    class Page extends PageObject {
      input = selector<HTMLInputElement>('input');
    }
    let page = new Page();

    expect(page.input.element?.value).toEqual('value1');
    expect(page.input.elements[0].value).toEqual('value1');
  });

  test('it works with a PageObject sub-class with an Element sub-type', () => {
    document.body.innerHTML = '<input value="value1">';

    class Page extends PageObject {
      input = selector(
        'input',
        class extends PageObject<HTMLInputElement> {
          get value() {
            return this.element?.value;
          }
        },
      );
    }
    let page = new Page();

    expect(page.input.element?.value).toEqual('value1');
    expect(page.input.elements[0].value).toEqual('value1');
    expect(page.input.value).toEqual('value1');
  });

  test('types', () => {
    class CustomPageObject extends PageObject {
      prop1 = 'value1';
    }
    class CustomPageObjectCustomElement extends PageObject<HTMLInputElement> {
      prop2 = 'value2';
    }

    class Page extends PageObject {
      /**
       * Expected cases
       */

      // All defaults -- `PageObject` producing `Element`s
      a = selector('.foo');
      // Customize elements -- `PageObject` producing `HTMLInputElement`s
      b = selector<HTMLInputElement>('.foo');
      // Customize page object -- `CustomPageObject` producing `Element`s
      c = selector('.foo', CustomPageObject);
      // Customize page object and elements -- `CustomPageObjectCustomElement`
      // producing `HTMLInputElement`s
      d = selector('.foo', CustomPageObjectCustomElement);

      /**
       * Valid, but not recommended cases
       */

      // Unnecessarily specify the default element type arguments
      e = selector<Element>('.foo');
      // Unnecessarily specify the default element and default page object type
      // arguments
      g = selector<Element, PageObject>('.foo', PageObject);
      // Unnecessarily specify the default element and custom page object type
      // arguments
      h = selector<Element, CustomPageObject>('.foo', CustomPageObject);
      // Unnecessarily specify the custom element and custom page object type
      // arguments
      i = selector<HTMLInputElement, CustomPageObjectCustomElement>(
        '.foo',
        CustomPageObjectCustomElement,
      );
      // Specify an element type argument that is different from, but cast-able
      // to, the page object's element type
      j = selector<Element, CustomPageObjectCustomElement>(
        '.foo',
        CustomPageObjectCustomElement,
      );
      // Specify a custom page object type whose element type is different from,
      // but cast-able to, the element type argument
      k = selector<Element, PageObject>('.foo', CustomPageObject);

      /**
       * Error cases
       */

      l = selector<Element>(
        '.foo',
        // @ts-expect-error cannot specify element type argument when passing a
        // custom page object function argument because the page object function
        // argument's type already includes the element type
        CustomPageObject,
      );
      // @ts-expect-error cannot specify a page object type argument without
      // passing the page object class as a function argument
      m = selector<Element, CustomPageObject>('.foo');
      n = selector<Element, CustomPageObject>(
        '.foo',
        // @ts-expect-error cannot pass a class function argument whose type is
        // incompatible with the page object type argument
        PageObject,
      );

      o = selector<
        HTMLInputElement,
        // @ts-expect-error cannot specify a page object type whose element type
        // is not cast-able to the element type argument
        CustomPageObject
      >('.foo', CustomPageObject);
    }

    expect(new Page()).toBeTruthy();
  });
});
