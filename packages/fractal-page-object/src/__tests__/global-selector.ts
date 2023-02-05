import { describe, afterEach, test, expect } from '@jest/globals';
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
        }
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
        }
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
        }
      );
    }
    let page = new Page('span');

    expect(page.input.element?.value).toEqual('value1');
    expect(page.input.elements[0].value).toEqual('value1');
    expect(page.input.value).toEqual('value1');
  });
});
