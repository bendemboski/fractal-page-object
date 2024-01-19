import { describe, afterEach, test, expect } from 'vitest';
import { selector, globalSelector, PageObject, setRoot } from '..';
import { resetRoot } from '../-private/root';

describe('globalSelector()', () => {
  afterEach(() => resetRoot());

  test('it requires a valid selector and the class must be a PageObject subclass', () => {
    expect(() => globalSelector('')).toThrow();
    expect(() => globalSelector('  ')).toThrow();
    expect(() => selector('$,')).toThrow();
    // @ts-expect-error violate types to make sure validation throws
    expect(() => globalSelector('', class {})).toThrow();
  });

  test('it works without a root element or class', () => {
    document.body.innerHTML = `
      <div>
        <span></span>
        <p></p>
      </div>
      <span></span>
    `;
    let div = document.body.children[0];
    let p = div.children[1];

    setRoot(div);

    class Page extends PageObject {
      p = selector('p');
      globalP = globalSelector('p');
    }
    let page = new Page('span');

    expect(page.p.element).toEqual(null);
    expect(page.globalP.element).toEqual(p);
    expect(page.globalP[0].element).toEqual(p);
  });

  test('it works with a root element', () => {
    document.body.innerHTML = `
      <div>
        <span></span>        
      </div>
      <section>
        <p></p>
      </section>
    `;
    let [div, section] = Array.from(document.body.children);
    let p = section.children[0];

    setRoot(div);

    class Page extends PageObject {
      p = selector('p');
      globalP = globalSelector('p', section);
    }
    let page = new Page('span');

    expect(page.p.element).toEqual(null);
    expect(page.globalP.element).toEqual(p);
    expect(page.globalP[0].element).toEqual(p);
  });

  test('it works with a class', () => {
    document.body.innerHTML = `
      <span></span>
      <p id="p1"></p>
    `;
    let p = document.body.children[1];

    class Page extends PageObject {
      p = globalSelector(
        'p',
        class extends PageObject {
          get elementId() {
            return this.element?.id;
          }
        },
      );
    }
    let page = new Page('span');

    expect(page.p.element).toEqual(p);
    expect(page.p.elementId).toEqual('p1');
    expect(page.p[0].element).toEqual(p);
    expect(page.p[0].elementId).toEqual('p1');
  });

  test('it works with a root element and class', () => {
    document.body.innerHTML = `
      <div>
        <span></span>        
      </div>
      <section>
        <p id="p1"></p>
      </section>
    `;
    let [div, section] = Array.from(document.body.children);
    let p = section.children[0];

    setRoot(div);

    class Page extends PageObject {
      p = selector('p');
      globalP = globalSelector(
        'p',
        section,
        class extends PageObject {
          get elementId() {
            return this.element?.id;
          }
        },
      );
    }
    let page = new Page('span');

    expect(page.p.element).toEqual(null);
    expect(page.globalP.element).toEqual(p);
    expect(page.globalP.elementId).toEqual('p1');
    expect(page.globalP[0].element).toEqual(p);
    expect(page.globalP[0].elementId).toEqual('p1');
  });

  test('it works with a scoped selector', () => {
    document.body.innerHTML = `
      <div>
        <p><span></span></p>
        <span></span>
      </div>
      <span></span>
    `;
    let div = document.body.children[0];
    let span = div.children[1];

    setRoot(div);

    class Page extends PageObject {
      span = selector('> span');
      globalSpan = globalSelector('> span');
    }
    let page = new Page('span');

    expect(page.span.element).toEqual(null);
    expect(page.globalSpan.element).toEqual(span);
    expect(page.globalSpan[0].element).toEqual(span);
  });

  test('it works with an Element sub-type', () => {
    document.body.innerHTML = `
      <input value="value1">
    `;

    class Page extends PageObject {
      input = globalSelector<HTMLInputElement>('input');
    }
    let page = new Page();

    expect(page.input.element?.value).toEqual('value1');
    expect(page.input.elements[0].value).toEqual('value1');
  });

  test('it works with a PageObject sub-class with an Element sub-type', () => {
    document.body.innerHTML = `
      <input value="value1">
    `;

    class Page extends PageObject {
      input = globalSelector(
        'input',
        class extends PageObject<HTMLInputElement> {
          get value() {
            return this.element?.value;
          }
        },
      );
    }
    let page = new Page('span');

    expect(page.input.element?.value).toEqual('value1');
    expect(page.input.elements[0].value).toEqual('value1');
    expect(page.input.value).toEqual('value1');
  });

  describe('types', () => {
    class CustomPageObject extends PageObject {
      prop1 = 'value1';
    }
    class CustomPageObjectCustomElement extends PageObject<HTMLInputElement> {
      prop2 = 'value2';
    }

    test('without root element', () => {
      class Page extends PageObject {
        /**
         * Expected cases
         */

        // All defaults -- `PageObject` producing `Element`s
        a = globalSelector('.foo');
        // Customize elements -- `PageObject` producing `HTMLInputElement`s
        b = globalSelector<HTMLInputElement>('.foo');
        // Customize page object -- `CustomPageObject` producing `Element`s
        c = globalSelector('.foo', CustomPageObject);
        // Customize page object and elements -- `CustomPageObjectCustomElement`
        // producing `HTMLInputElement`s
        d = globalSelector('.foo', CustomPageObjectCustomElement);

        /**
         * Valid, but not recommended cases
         */

        // Unnecessarily specify the default element type arguments
        e = globalSelector<Element>('.foo');
        // Unnecessarily specify the default element and default page object type
        // arguments
        g = globalSelector<Element, PageObject>('.foo', PageObject);
        // Unnecessarily specify the default element and custom page object type
        // arguments
        h = globalSelector<Element, CustomPageObject>('.foo', CustomPageObject);
        // Unnecessarily specify the custom element and custom page object type
        // arguments
        i = globalSelector<HTMLInputElement, CustomPageObjectCustomElement>(
          '.foo',
          CustomPageObjectCustomElement,
        );
        // Specify an element type argument that is different from, but cast-able
        // to, the page object's element type
        j = globalSelector<Element, CustomPageObjectCustomElement>(
          '.foo',
          CustomPageObjectCustomElement,
        );
        // Specify a custom page object type whose element type is different from,
        // but cast-able to, the element type argument
        k = globalSelector<Element, PageObject>('.foo', CustomPageObject);

        /**
         * Error cases
         */

        l = globalSelector<Element>(
          '.foo',
          // @ts-expect-error cannot specify element type argument when passing a
          // custom page object function argument because the page object function
          // argument's type already includes the element type
          CustomPageObject,
        );
        // @ts-expect-error cannot specify a page object type argument without
        // passing the page object class as a function argument
        m = globalSelector<Element, CustomPageObject>('.foo');
        n = globalSelector<Element, CustomPageObject>(
          '.foo',
          // @ts-expect-error cannot pass a class function argument whose type is
          // incompatible with the page object type argument
          PageObject,
        );

        o = globalSelector<
          HTMLInputElement,
          // @ts-expect-error cannot specify a page object type whose element type
          // is not cast-able to the element type argument
          CustomPageObject
        >('.foo', CustomPageObject);
      }

      expect(new Page()).toBeTruthy();
    });

    test('with root element', () => {
      class Page extends PageObject {
        /**
         * Expected cases
         */

        // All defaults -- `PageObject` producing `Element`s
        a = globalSelector('.foo', document.body);
        // Customize elements -- `PageObject` producing `HTMLInputElement`s
        b = globalSelector<HTMLInputElement>('.foo', document.body);
        // Customize page object -- `CustomPageObject` producing `Element`s
        c = globalSelector('.foo', document.body, CustomPageObject);
        // Customize page object and elements -- `CustomPageObjectCustomElement`
        // producing `HTMLInputElement`s
        d = globalSelector(
          '.foo',
          document.body,
          CustomPageObjectCustomElement,
        );

        /**
         * Valid, but not recommended cases
         */

        // Unnecessarily specify the default element type arguments
        e = globalSelector<Element>('.foo', document.body);
        // Unnecessarily specify the default element and default page object type
        // arguments
        g = globalSelector<Element, PageObject>(
          '.foo',
          document.body,
          PageObject,
        );
        // Unnecessarily specify the default element and custom page object type
        // arguments
        h = globalSelector<Element, CustomPageObject>(
          '.foo',
          document.body,
          CustomPageObject,
        );
        // Unnecessarily specify the custom element and custom page object type
        // arguments
        i = globalSelector<HTMLInputElement, CustomPageObjectCustomElement>(
          '.foo',
          document.body,
          CustomPageObjectCustomElement,
        );
        // Specify an element type argument that is different from, but cast-able
        // to, the page object's element type
        j = globalSelector<Element, CustomPageObjectCustomElement>(
          '.foo',
          document.body,
          CustomPageObjectCustomElement,
        );
        // Specify a custom page object type whose element type is different from,
        // but cast-able to, the element type argument
        k = globalSelector<Element, PageObject>(
          '.foo',
          document.body,
          CustomPageObject,
        );

        /**
         * Error cases
         */

        l = globalSelector<Element>(
          '.foo',
          document.body,
          // @ts-expect-error cannot specify element type argument when passing a
          // custom page object function argument because the page object function
          // argument's type already includes the element type
          CustomPageObject,
        );
        // @ts-expect-error cannot specify a page object type argument without
        // passing the page object class as a function argument
        m = globalSelector<Element, CustomPageObject>('.foo', document.body);
        n = globalSelector<Element, CustomPageObject>(
          '.foo',
          document.body,
          // @ts-expect-error cannot pass a class function argument whose type is
          // incompatible with the page object type argument
          PageObject,
        );

        o = globalSelector<
          HTMLInputElement,
          // @ts-expect-error cannot specify a page object type whose element type
          // is not cast-able to the element type argument
          CustomPageObject
        >('.foo', document.body, CustomPageObject);
      }

      expect(new Page()).toBeTruthy();
    });
  });
});
