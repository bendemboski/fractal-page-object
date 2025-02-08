import { describe, beforeEach, afterEach, test, expect } from 'vitest';
import { PageObject, setRoot } from '../fractal-page-object';
import { resetRoot } from '../-private/root';
import { getDOMQuery } from '../-private/page-object-state';
import cloneWithIndex from '../-private/clone-with-index';
import {
  resolveDOMElement,
  resolveDOMElements,
  resolveDescription,
} from 'dom-element-descriptors';
import selector from '../selector';

describe('PageObject', () => {
  afterEach(() => resetRoot());

  describe('tree structure', () => {
    // Validate that the DOMQuery determines `element` and `elements so our
    // other tests can just validate the DOMQuery properties
    test('element and elements come from the DOMQuery', () => {
      document.body.innerHTML = '<div></div><div></div>';
      const [div1, div2] = Array.from(document.body.children);

      function checkQuery(
        page: PageObject,
        selector: string,
        elements: Element[],
      ) {
        expect(getDOMQuery(page).root).toEqual(document.body);
        expect(getDOMQuery(page).selectorArray.toString()).toEqual(selector);
        expect(page.element).toEqual(getDOMQuery(page).query());
        expect(page.elements).toEqual(getDOMQuery(page).queryAll());
        expect(page.element).toEqual(elements[0] || null);
        expect(page.elements).toEqual(elements);
      }

      checkQuery(new PageObject(), '', [document.body]);
      checkQuery(new PageObject('div', null, 1), 'div[1]', [div2]);
      checkQuery(new PageObject('div', null, 2), 'div[2]', []);
      checkQuery(new PageObject('div', new PageObject()), 'div', [div1, div2]);
      checkQuery(new PageObject('div', new PageObject(), 1), 'div[1]', [div2]);
      checkQuery(new PageObject('div', new PageObject(), 2), 'div[2]', []);
    });

    describe('root', () => {
      describe('without parent', () => {
        test('defaults to body', () => {
          const page = new PageObject();
          expect(getDOMQuery(page).root).toEqual(document.body);
        });

        test('respects setRoot()', () => {
          document.body.innerHTML = '<div></div>';
          const div = document.body.children[0];

          setRoot(div);

          const page = new PageObject();
          expect(getDOMQuery(page).root).toEqual(div);
        });
      });

      describe('with parent', () => {
        test('defaults to body', () => {
          const parent = new PageObject();
          const page = new PageObject('', parent);
          expect(getDOMQuery(page).root).toEqual(document.body);
        });

        test('respects setRoot()', () => {
          document.body.innerHTML = '<div></div>';
          const div = document.body.children[0];

          setRoot(div);

          const parent = new PageObject();
          const page = new PageObject('', parent);
          expect(getDOMQuery(page).root).toEqual(div);
        });

        test('is parent when parent is element', () => {
          document.body.innerHTML = '<div></div>';
          const div = document.body.children[0];

          const page = new PageObject('', div);
          expect(getDOMQuery(page).root).toEqual(div);
        });

        test('inherits parent root when grandparent is element', () => {
          document.body.innerHTML = '<div></div>';
          const div = document.body.children[0];

          const parent = new PageObject('', div);
          let page = new PageObject('', parent);
          expect(getDOMQuery(page).root).toEqual(div);

          page = cloneWithIndex(parent, 0);
          expect(getDOMQuery(page).root).toEqual(div);
        });
      });
    });

    describe('selector array', () => {
      describe('with no parent', () => {
        describe('without a selector', () => {
          test('it can have an index', () => {
            let page = new PageObject('', null, 0);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual('[0]');

            page = new PageObject('', null, 1);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual('[1]');
          });

          test('it can clone with index', () => {
            const page = new PageObject();

            const page0 = cloneWithIndex(page, 0);
            expect(getDOMQuery(page0).selectorArray.toString()).toEqual('[0]');

            const page1 = cloneWithIndex(page, 1);
            expect(getDOMQuery(page1).selectorArray.toString()).toEqual('[1]');
          });
        });

        describe('with a selector', () => {
          test('it works', () => {
            const page = new PageObject('div');
            expect(getDOMQuery(page).selectorArray.toString()).toEqual('div');
          });

          test('it can have an index', () => {
            document.body.innerHTML = '<div></div><div></div>';

            let page = new PageObject('div', null, 0);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[0]',
            );

            page = new PageObject('div', null, 1);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[1]',
            );

            page = new PageObject('div', null, 2);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[2]',
            );
          });

          test('it can clone with index', () => {
            document.body.innerHTML = '<div></div><div></div>';

            const page = new PageObject('div');

            const page0 = cloneWithIndex(page, 0);
            expect(getDOMQuery(page0).selectorArray.toString()).toEqual(
              'div[0]',
            );

            const page1 = cloneWithIndex(page, 1);
            expect(getDOMQuery(page1).selectorArray.toString()).toEqual(
              'div[1]',
            );

            const page2 = cloneWithIndex(page, 2);
            expect(getDOMQuery(page2).selectorArray.toString()).toEqual(
              'div[2]',
            );
          });
        });
      });

      describe('with an element parent', () => {
        test('it works', () => {
          document.body.innerHTML = '<span></span>';
          const span = document.body.children[0];

          const page = new PageObject('div', span);
          expect(getDOMQuery(page).selectorArray.toString()).toEqual('div');
        });

        test('it can have an index', () => {
          document.body.innerHTML = `
            <span>
              <div></div>
              <div></div>
            </span>
            <div></div>
          `;
          const span = document.body.children[0];

          let page = new PageObject('div', span, 0);
          expect(getDOMQuery(page).selectorArray.toString()).toEqual('div[0]');

          page = new PageObject('div', span, 1);
          expect(getDOMQuery(page).selectorArray.toString()).toEqual('div[1]');

          page = new PageObject('div', span, 2);
          expect(getDOMQuery(page).selectorArray.toString()).toEqual('div[2]');
        });

        test('it can clone with index', () => {
          document.body.innerHTML = `
            <span>
              <div></div>
              <div></div>
            </span>
            <div></div>
          `;
          const span = document.body.children[0];

          const page = new PageObject('div', span);

          const page0 = cloneWithIndex(page, 0);
          expect(getDOMQuery(page0).selectorArray.toString()).toEqual('div[0]');

          const page1 = cloneWithIndex(page, 1);
          expect(getDOMQuery(page1).selectorArray.toString()).toEqual('div[1]');

          const page2 = cloneWithIndex(page, 2);
          expect(getDOMQuery(page2).selectorArray.toString()).toEqual('div[2]');
        });
      });

      describe('with a PageObject parent', () => {
        describe('parent without selector', () => {
          test('it works', () => {
            const parent = new PageObject();

            const page = new PageObject('div', parent);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual('div');
          });

          test('it can have an index', () => {
            document.body.innerHTML = '<div></div><div></div>';

            const parent = new PageObject();

            let page = new PageObject('div', parent, 0);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[0]',
            );

            page = new PageObject('div', parent, 1);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[1]',
            );

            page = new PageObject('div', parent, 2);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[2]',
            );
          });

          test('it can clone with index', () => {
            document.body.innerHTML = '<div></div><div></div>';

            const parent = new PageObject();
            const page = new PageObject('div', parent);

            const page0 = cloneWithIndex(page, 0);
            expect(getDOMQuery(page0).selectorArray.toString()).toEqual(
              'div[0]',
            );

            const page1 = cloneWithIndex(page, 1);
            expect(getDOMQuery(page1).selectorArray.toString()).toEqual(
              'div[1]',
            );

            const page2 = cloneWithIndex(page, 2);
            expect(getDOMQuery(page2).selectorArray.toString()).toEqual(
              'div[2]',
            );
          });
        });

        describe('parent with selector', () => {
          test('it works', () => {
            document.body.innerHTML = '<div></div>';

            const parent = new PageObject('div');
            const page = new PageObject('span', parent);
            expect(getDOMQuery(page).root).toEqual(document.body);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div span',
            );
          });

          test('it can have an index', () => {
            document.body.innerHTML = '<div><span></span><span></span></div>';

            const parent = new PageObject('div');

            let page = new PageObject('span', parent, 0);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div span[0]',
            );

            page = new PageObject('span', parent, 1);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div span[1]',
            );

            page = new PageObject('span', parent, 2);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div span[2]',
            );
          });

          test('it can clone with index', () => {
            document.body.innerHTML = '<div><span></span><span></span></div>';

            const parent = new PageObject('div');
            const page = new PageObject('span', parent);

            const page0 = cloneWithIndex(page, 0);
            expect(getDOMQuery(page0).selectorArray.toString()).toEqual(
              'div span[0]',
            );

            const page1 = cloneWithIndex(page, 1);
            expect(getDOMQuery(page1).selectorArray.toString()).toEqual(
              'div span[1]',
            );

            const page2 = cloneWithIndex(page, 2);
            expect(getDOMQuery(page2).selectorArray.toString()).toEqual(
              'div span[2]',
            );
          });
        });

        describe('parent with selector and index', () => {
          test('it works', () => {
            document.body.innerHTML = '<div></div><div></div>';

            const parent = new PageObject('div', null, 1);
            const page = new PageObject('span', parent);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[1] span',
            );
          });

          test('it can have an index', () => {
            document.body.innerHTML = '<div><span></span><span></span></div>';

            const parent = new PageObject('div', null, 1);

            let page = new PageObject('span', parent, 0);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[1] span[0]',
            );

            page = new PageObject('span', parent, 1);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[1] span[1]',
            );

            page = new PageObject('span', parent, 2);
            expect(getDOMQuery(page).selectorArray.toString()).toEqual(
              'div[1] span[2]',
            );
          });

          test('it can clone with index', () => {
            document.body.innerHTML = '<div><span></span><span></span></div>';

            const parent = new PageObject('div', null, 1);
            const page = new PageObject('span', parent);

            const page0 = cloneWithIndex(page, 0);
            expect(getDOMQuery(page0).selectorArray.toString()).toEqual(
              'div[1] span[0]',
            );

            const page1 = cloneWithIndex(page, 1);
            expect(getDOMQuery(page1).selectorArray.toString()).toEqual(
              'div[1] span[1]',
            );

            const page2 = cloneWithIndex(page, 2);
            expect(getDOMQuery(page2).selectorArray.toString()).toEqual(
              'div[1] span[2]',
            );
          });
        });
      });
    });
  });

  describe('array API', () => {
    test('basic functionality', () => {
      document.body.innerHTML = `
        <span id="span1" data-index="2"></span>
        <span id="span2" data-index="1"></span>
      `;
      const [span1, span2] = Array.from(document.body.children);

      const page = new PageObject('span');
      const empty = new PageObject('p');

      expect(page.length).toEqual(2);
      expect(empty.length).toEqual(0);

      //
      // A somewhat representative subset of the Array methods
      //
      expect(page.map((o) => o.element.id)).toEqual(['span1', 'span2']);
      expect(empty.map((o) => o.element.id)).toEqual([]);
      expect(page.find((o) => o.element.id === 'span2')?.element).toEqual(
        span2,
      );
      expect(empty.find((o) => o.element.id === 'span2')).toEqual(undefined);
      expect(
        page.filter((o) => o.element.id === 'span2').map((o) => o.element),
      ).toEqual([span2]);
      expect(empty.filter((o) => o.element.id === 'span2')).toEqual([]);
      expect(
        page
          .sort(
            (a, b) =>
              Number(b.element.id.slice(-1)) - Number(a.element.id.slice(-1)),
          )
          .map((o) => o.element),
      ).toEqual([span2, span1]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      expect(empty.sort((_a, _b) => -1)).toEqual([]);
      expect(Array.from(page[Symbol.iterator]()).map((o) => o.element)).toEqual(
        [span1, span2],
      );
      expect(
        Array.from(empty[Symbol.iterator]()).map((o) => o.element),
      ).toEqual([]);
    });

    describe('indexing', () => {
      let div1: Element;
      let div2: Element;
      let span1: Element;
      let span2: Element;
      let span3: Element;

      beforeEach(() => {
        document.body.innerHTML = `
          <div>
            <span></span>
          </div>
          <div>
            <span></span>
            <span></span>
          </div>
        `;

        [div1, div2] = Array.from(document.body.children);
        [span1] = Array.from(div1.children);
        [span2, span3] = Array.from(div2.children);
      });

      test('without parent', () => {
        const page = new PageObject('div');
        expect(page[0].element).toEqual(div1);
        expect(page[1].element).toEqual(div2);
        expect(page[2].element).toEqual(null);
        expect(page[-1].element).toEqual(null);
      });

      test('without parent and a non-matching selector', () => {
        const page = new PageObject('p');
        expect(page[0].element).toEqual(null);
        expect(page[1].element).toEqual(null);
        expect(page[-1].element).toEqual(null);
      });

      test('with parent', () => {
        const page = new PageObject('span', new PageObject('div'));
        expect(page[0].element).toEqual(span1);
        expect(page[1].element).toEqual(span2);
        expect(page[2].element).toEqual(span3);
        expect(page[3].element).toEqual(null);
        expect(page[-1].element).toEqual(null);
      });

      test('with indexed parent', () => {
        const page = new PageObject('span', new PageObject('div', null, 1));
        expect(page[0].element).toEqual(span2);
        expect(page[1].element).toEqual(span3);
        expect(page[2].element).toEqual(null);
        expect(page[-1].element).toEqual(null);
      });

      test('with parent and a non-matching selector', () => {
        const page = new PageObject('p', new PageObject('div'));
        expect(page[0].element).toEqual(null);
        expect(page[1].element).toEqual(null);
        expect(page[-1].element).toEqual(null);
      });

      test('with indexed parent and a non-matching selector', () => {
        const page = new PageObject('p', new PageObject('div', null, 1));
        expect(page[0].element).toEqual(null);
        expect(page[1].element).toEqual(null);
        expect(page[-1].element).toEqual(null);
      });

      test("with parent whose selector doesn't match", () => {
        const page = new PageObject('span', new PageObject('p'));
        expect(page[0].element).toEqual(null);
        expect(page[1].element).toEqual(null);
        expect(page[-1].element).toEqual(null);
      });

      test("with parent whose index doesn't match", () => {
        const page = new PageObject('span', new PageObject('div', null, 2));
        expect(page[0].element).toEqual(null);
        expect(page[1].element).toEqual(null);
        expect(page[-1].element).toEqual(null);
      });

      test('with an index', () => {
        const page = new PageObject('div', null, 0);
        expect(page[0].element).toEqual(div1);
        expect(page[1].element).toEqual(null);
        expect(page[5].element).toEqual(null);
      });

      test('non-integer indexes do not mess things up', () => {
        const page = new PageObject('div');
        expect(page[NaN]).toBeUndefined();
        expect(page[1.2]).toBeUndefined();
      });
    });
  });

  describe('document fragments', () => {
    test('it works with a document fragment root', () => {
      const fragment = document.createDocumentFragment();
      const span = document.createElement('span');
      fragment.append(span);

      setRoot(fragment);

      const page = new PageObject();
      expect(getDOMQuery(page).root).toEqual(fragment);
      expect(getDOMQuery(page).createChild('span', null).query()).toEqual(span);
    });

    test('it can have a document fragment parent', () => {
      const fragment = document.createDocumentFragment();
      const span = document.createElement('span');
      fragment.append(span);

      const page = new PageObject('span', fragment);
      expect(getDOMQuery(page).query()).toEqual(span);
    });
  });

  describe('subclasses', () => {
    let div1: Element;
    let div2: Element;

    beforeEach(() => {
      document.body.innerHTML = `
        <div id="div1"></div>
        <div id="div2"></div>
      `;
      [div1, div2] = Array.from(document.body.children);
    });

    test('element/elements are accessible', () => {
      class Page extends PageObject {
        getFn() {
          return `getFn ${this.element?.id}:[${this.elements
            .map((e) => e.id)
            .join(',')}]`;
        }
        get getter() {
          return `getter ${this.element?.id}:[${this.elements
            .map((e) => e.id)
            .join(',')}]`;
        }
      }
      const page = new Page('div');

      expect(page.element).toEqual(div1);
      expect(page.elements).toEqual([div1, div2]);
      expect(page.getFn()).toEqual('getFn div1:[div1,div2]');
      expect(page.getter).toEqual('getter div1:[div1,div2]');
    });

    test('array API is accessible', () => {
      class Page extends PageObject {
        getFn() {
          return `getFn ${this[1].element?.id}:[${this.map(
            (o) => o.element.id,
          ).join(',')}]`;
        }
        get getter(): string {
          return `getter ${this[1].element?.id}:[${this.map(
            (o) => o.element.id,
          ).join(',')}]`;
        }
      }
      const page = new Page('div');

      expect(page[0].element).toEqual(div1);
      expect(page.map((o) => o.element)).toEqual([div1, div2]);
      expect(page.getFn()).toEqual('getFn div2:[div1,div2]');
      expect(page.getter).toEqual('getter div2:[div1,div2]');
    });

    test('members are accessible', () => {
      class Page extends PageObject {
        getFn() {
          return `getFn ${this.str}`;
        }
        get getter(): string {
          return `getter ${this.strFn()}`;
        }

        get str() {
          return `${this.element?.id}:[${this.elements
            .map((e) => e.id)
            .join(',')}]`;
        }
        strFn() {
          return `${this.element?.id}:[${this.elements
            .map((e) => e.id)
            .join(',')}]`;
        }
      }
      const page = new Page('div');

      expect(page.getFn()).toEqual('getFn div1:[div1,div2]');
      expect(page.getter).toEqual('getter div1:[div1,div2]');
    });

    test('array API produces instances of the same class', () => {
      class Page extends PageObject {
        customProp = 'val';
      }
      const page = new Page('div');
      expect(page[0]).toBeInstanceOf(Page);
      expect(page[0].customProp).toEqual('val');
      expect(page[3]).toBeInstanceOf(Page);
      expect(page[3].customProp).toEqual('val');
      expect(page.map((o) => o.constructor)).toEqual([Page, Page]);
      expect(page.map((o) => o.customProp)).toEqual(['val', 'val']);
    });

    test('overriding members of the array API works', () => {
      class Page extends PageObject {
        // @ts-expect-error this violates typescript, but users might want to anyway
        filter() {
          return 'byName';
        }
      }
      const page = new Page('div');
      expect(page.filter()).toEqual('byName');
    });
  });

  describe('element type checking', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="div1"></div>';
    });

    test('is nullable when accessing directly, via this, or via indexing', () => {
      const page = new PageObject('div');

      // @ts-expect-error verifying null-ability
      expect(page.element.id).toEqual('div1');
      // @ts-expect-error verifying null-ability
      expect(page[0].element.id).toEqual('div1');

      class Page extends PageObject {
        get prop() {
          // @ts-expect-error verifying null-ability
          return this.element.id;
        }

        get prop2() {
          // @ts-expect-error verifying null-ability
          return this[0].element.id;
        }
      }
      const page2 = new Page('div');

      // @ts-expect-error verifying null-ability
      expect(page2.element.id).toEqual('div1');
      // @ts-expect-error verifying null-ability
      expect(page2[0].element.id).toEqual('div1');
    });

    test('is non-null when accessing via array iteration methods', () => {
      const page = new PageObject('div');

      expect(page.map((o) => o.element.id)).toEqual(['div1']);

      class Page extends PageObject {
        get prop(): string[] {
          return this.map((o) => o.element.id);
        }
      }
      const page2 = new Page('div');

      expect(page2.map((o) => o.element.id)).toEqual(['div1']);
    });

    test('the element type can be specified', () => {
      document.body.innerHTML = `
        <input value="value1">
        <input value="value2">
      `;

      const page = new PageObject<HTMLInputElement>('input');

      expect(page.element?.value).toEqual('value1');
      expect(page.elements[0].value).toEqual('value1');
      expect(page.elements[1].value).toEqual('value2');
      expect(page.elements.map((el) => el.value)).toEqual(['value1', 'value2']);
    });

    test('the element type applies to subclasses', () => {
      document.body.innerHTML = `
        <input value="value1">
        <input value="value2">
      `;
      class Page extends PageObject<HTMLInputElement> {
        getFn() {
          return `getFn ${this.element?.value}:[${this.elements
            .map((e) => e.value)
            .join(',')}]`;
        }
        get getter() {
          return `getter ${this.element?.value}:[${this.elements
            .map((e) => e.value)
            .join(',')}]`;
        }
      }
      const page = new Page('input');

      expect(page.element?.value).toEqual('value1');
      expect(page.elements[0]?.value).toEqual('value1');
      expect(page.elements[1]?.value).toEqual('value2');
      expect(page.elements.map((el) => el.value)).toEqual(['value1', 'value2']);
      expect(page.getFn()).toEqual('getFn value1:[value1,value2]');
      expect(page.getter).toEqual('getter value1:[value1,value2]');
    });
  });

  describe('dom-element-descriptors integration', () => {
    test('works', () => {
      document.body.innerHTML = '<div id="div1"></div><div id="div2"></div>';
      const [div1, div2] = Array.from(document.body.children);

      class Page extends PageObject {
        divs = selector('div');
      }
      const page = new Page();

      expect(resolveDOMElement(page.divs)).toEqual(div1);
      expect(resolveDOMElements(page.divs)).toEqual([div1, div2]);
    });

    test('evaluates the root lazily', () => {
      document.body.innerHTML = [
        '<div id="div1"></div>',
        '<span id="root">',
        '<div id="div2"></div>',
        '<div id="div3"></div>',
        '</span>',
      ].join('');
      const [div1, root] = Array.from(document.body.children);
      const [div2, div3] = Array.from(root.children);

      class Page extends PageObject {
        divs = selector('div');
      }
      const page = new Page();

      expect(resolveDOMElement(page.divs)).toEqual(div1);
      expect(resolveDOMElements(page.divs)).toEqual([div1, div2, div3]);

      setRoot(root);
      expect(resolveDOMElement(page.divs)).toEqual(div2);
      expect(resolveDOMElements(page.divs)).toEqual([div2, div3]);
    });

    test('implements a description', () => {
      class Page extends PageObject {
        divs = selector(
          'div',
          class extends PageObject {
            spans = selector('span');
          },
        );
      }
      const page = new Page();

      expect(resolveDescription(page)).toEqual('');
      expect(resolveDescription(page.divs)).toEqual('div');
      expect(resolveDescription(page.divs[0].spans[1])).toEqual(
        'div[0] span[1]',
      );
    });
  });
});
