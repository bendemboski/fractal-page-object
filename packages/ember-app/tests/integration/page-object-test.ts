import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, type RenderingTestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { globalSelector, PageObject, selector } from 'fractal-page-object';
import {
  type ElementLike,
  isElementLike,
  type PageObjectConstructor,
} from 'fractal-page-object';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

module('Integration | page object', function (hooks) {
  setupRenderingTest(hooks);

  test('page objects provide the correct root', async function (this: RenderingTestContext, assert) {
    const Page = class extends PageObject {
      target = selector('[data-target]');
    };
    let page = new Page();
    assert.strictEqual(page.element, this.element as Element | null);

    let div = document.createElement('div');
    div.setAttribute('data-target', '');

    document.body.append(div);
    try {
      await render(hbs`<div data-target>Hello world</div>`);
      assert.dom(page.target.element).exists({ count: 1 });
      assert.dom(page.target.element).hasText('Hello world');
    } finally {
      div.remove();
    }
  });

  test('types are exported', async function (assert) {
    await render(hbs`<div id="div1"></div>`);

    let page = new PageObject('div');

    assert.strictEqual(page.element?.id, 'div1');
    assert.strictEqual(page[0].element?.id, 'div1');

    const Page = class extends PageObject {
      get prop() {
        return this.element?.id;
      }

      get prop2() {
        return this[0].element?.id;
      }
    };
    let page2 = new Page('div');

    assert.strictEqual(page2.element?.id, 'div1');
    assert.strictEqual(page2[0].element?.id, 'div1');
  });

  test('can wrap selector()', async function (assert) {
    /**
     * A helper to wrap the `selector()` function, mainly to ease the type
     * juggling
     *
     * @param transform a function that takes the arguments to {@link selector},
     * optionally transforms them, and returns the new transformed arguments
     * @returns a function that can be used in place of {@link selector} but
     * applies the given transformation
     */
    function wrapSelector(
      transform: <
        ElementType extends Element,
        T extends PageObject<ElementType>,
      >(
        name: string,
        Class?: PageObjectConstructor<ElementType, T>,
      ) => [string, PageObjectConstructor<ElementType, T>?],
    ) {
      function s<ElementType extends Element = Element>(
        name: string,
      ): PageObject<ElementType>;
      function s<
        ElementType extends Element,
        T extends PageObject<ElementType>,
      >(name: string, Class: PageObjectConstructor<ElementType, T>): T;

      function s<
        ElementType extends Element = Element,
        T extends PageObject<ElementType> = PageObject<ElementType>,
      >(name: string, Class?: PageObjectConstructor<ElementType, T>) {
        [name, Class] = transform(name, Class);
        return Class ? selector(name, Class) : selector<ElementType>(name);
      }
      return s;
    }

    const s = wrapSelector(<T>(name: string, Class: T) => [
      `[data-name="${name}"]`,
      Class,
    ]);

    // Check that `wrapSelector` produces functions that are type-compatible
    // with `selector`
    function testSelector(sFn: typeof selector) {
      return sFn;
    }
    assert.strictEqual(testSelector(s), s);

    await render(hbs`
      <div data-name="one" class="div-one"/>
      <div data-name="two" class="div-two">
        <input
          data-name="three"
          value="three"
          {{! template-lint-disable require-input-label }}
        >
      </div>
    `);

    const Page = class extends PageObject {
      one = s('one');
      two = s(
        'two',
        class extends PageObject {
          three = s<HTMLInputElement>('three');
        },
      );
    };
    let page = new Page();

    assert.dom(page.one.element).hasClass('div-one');
    assert.dom(page.two.element).hasClass('div-two');
    assert.strictEqual(page.two.three.element?.value, 'three');
  });

  test('can wrap globalSelector()', async function (assert) {
    /**
     * A helper to wrap the `globalSelector()` function, mainly to ease the type
     * juggling
     *
     * @param transform a function that takes the arguments to
     * {@link globalSelector}, optionally transforms them, and returns the new
     * transformed arguments
     * @returns a function that can be used in place of {@link globalSelector}
     * but applies the given transformation
     */
    function wrapGlobalSelector(
      transform: <
        ElementType extends Element,
        T extends PageObject<ElementType>,
      >(
        name: string,
        rootElement?: ElementLike,
        Class?: PageObjectConstructor<ElementType, T>,
      ) => [string, ElementLike?, PageObjectConstructor<ElementType, T>?],
    ) {
      function gs<ElementType extends Element = Element>(
        selector: string,
      ): PageObject<ElementType>;
      function gs<
        ElementType extends Element,
        T extends PageObject<ElementType>,
      >(name: string, Class: PageObjectConstructor<ElementType, T>): T;

      function gs<ElementType extends Element = Element>(
        selector: string,
        rootElement: ElementLike,
      ): PageObject<ElementType>;
      function gs<
        ElementType extends Element,
        T extends PageObject<ElementType>,
      >(
        name: string,
        rootElement: ElementLike,
        Class: PageObjectConstructor<ElementType, T>,
      ): T;

      function gs<
        ElementType extends Element = Element,
        T extends PageObject<ElementType> = PageObject<ElementType>,
      >(
        ...args:
          | [string, PageObjectConstructor<ElementType, T>?]
          | [string, ElementLike, PageObjectConstructor<ElementType, T>?]
      ) {
        let name;
        let rootElement;
        let Class;

        if (isElementLike(args[1])) {
          [name, rootElement, Class] = transform(args[0], args[1], args[2]);
        } else {
          [name, rootElement, Class] = transform(args[0], undefined, args[1]);
        }

        if (rootElement) {
          return Class
            ? globalSelector(name, rootElement, Class)
            : globalSelector<ElementType>(name, rootElement);
        } else {
          return Class
            ? globalSelector(name, Class)
            : globalSelector<ElementType>(name);
        }
      }
      return gs;
    }

    const gs = wrapGlobalSelector(
      <S, T>(name: string, rootElement: S, Class: T) => [
        `[data-name="${name}"]`,
        rootElement,
        Class,
      ],
    );

    // Check that `wrapGlobalSelector` produces functions that are
    // type-compatible with `globalSelector`
    function testGlobalSelector(gsFn: typeof globalSelector) {
      return gsFn;
    }
    testGlobalSelector(gs);

    await render(hbs`
      <div data-name="one" class="div-one"/>
      <div data-name="two" class="div-two">
        <input
          data-name="three"
          value="three"
          {{! template-lint-disable require-input-label }}
        >
      </div>
    `);

    let div = document.createElement('div');
    document.body.append(div);
    try {
      const Page = class extends PageObject {
        one = gs('one');
        two = gs(
          'two',
          class extends PageObject {
            three = gs<HTMLInputElement>('three');
          },
        );

        oneRoot = gs('one-root', document.body);
        twoRoot = gs(
          'two-root',
          document.body,
          class extends PageObject {
            threeRoot = gs<HTMLInputElement>('three-root', document.body);
          },
        );
      };
      let page = new Page();

      div.innerHTML = `
        <div data-name="one-root" class="div-one-root"/>
        <div data-name="two-root" class="div-two-root">
          <input
            data-name="three-root"
            value="three-root"
          >
        </div>
      `;

      assert.dom(page.one.element).hasClass('div-one');
      assert.dom(page.two.element).hasClass('div-two');
      assert.strictEqual(page.two.three.element?.value, 'three');

      assert.dom(page.oneRoot.element).hasClass('div-one-root');
      assert.dom(page.twoRoot.element).hasClass('div-two-root');
      assert.strictEqual(page.twoRoot.threeRoot.element?.value, 'three-root');
    } finally {
      div.remove();
    }
  });

  test('it can query the shadow DOM', async function (this: RenderingTestContext, assert) {
    await render(hbs`<div data-target><div data-child></div></div>`);

    let target = this.element.querySelector('[data-target]')!;
    let span = document.createElement('span');
    target?.attachShadow({ mode: 'open' }).append(span);

    let child = this.element.querySelector('[data-child]')!;
    let childSpan = document.createElement('span');
    child?.attachShadow({ mode: 'open' }).append(childSpan);

    const ShadowPage = class extends PageObject {
      span = selector('span');
    };

    const Page = class extends PageObject {
      get shadowRoot() {
        return this.element?.shadowRoot
          ? new ShadowPage('', this.element.shadowRoot)
          : new ShadowPage('does_not_exist');
      }

      get shadowSpan() {
        return this.element?.shadowRoot
          ? new PageObject('span', this.element.shadowRoot)
          : new PageObject('does_not_exist');
      }

      get childShadowSpan() {
        let child = this.element?.querySelector('[data-child]')?.shadowRoot;
        return child
          ? new PageObject('span', child)
          : new PageObject('does_not_exist');
      }
    };
    let page = new Page('[data-target]');

    assert.strictEqual(page.shadowRoot.span.element, span);
    assert.strictEqual(page.shadowSpan.element, span);
    assert.strictEqual(page.childShadowSpan.element, childSpan);
  });

  test('smoke test', async function (assert) {
    const ListItem = class extends PageObject {
      get text() {
        return this.element?.textContent;
      }
    };

    const Page = class extends PageObject {
      header = selector(
        '.header',
        class extends PageObject {
          title = selector('.title');
          showList = selector('button');
        },
      );

      list = selector(
        '.list',
        class extends PageObject {
          listItems = selector('li', ListItem);
          loadMore = selector('.load-more');
        },
      );
    };
    let page = new Page();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Context {
      @tracked list: string[] = [];

      @action
      showList() {
        this.loadMore();
      }

      @action
      loadMore() {
        for (let i = 0; i < 5; i += 1) {
          this.list = [...this.list, `item${this.list.length}`];
        }
      }
    }
    this.set('context', new Context());

    await render(hbs`
      <div class="header">
        <div class="title">List of stuff</div>
        <button type="button" {{on "click" this.context.showList}}>Load list</button>
      </div>
      {{#if this.context.list}}
        <ul class="list">
          {{#each this.context.list as |item|}}
            <li>{{item}}</li>
          {{/each}}
          <li><a href="#" class="load-more" {{on "click" this.context.loadMore}}>load more</a></li>
        </ul>
      {{/if}}
    `);

    assert.dom(page.header.title.element).hasText('List of stuff');
    assert.dom(page.list.element).doesNotExist();
    assert.strictEqual(page.list.listItems.length, 0);
    assert.dom(page.list.listItems[0].element).doesNotExist();
    assert.dom(page.list.loadMore.element).doesNotExist();

    await click(page.header.showList.element!);
    assert.dom(page.list.element).exists();
    assert.strictEqual(page.list.listItems.length, 6);
    assert.dom(page.list.listItems[0].element).exists();
    assert.dom(page.list.listItems[1].element).exists();
    assert.dom(page.list.listItems[6].element).doesNotExist();
    assert.deepEqual(
      page.list.listItems.map((item) => item.text),
      ['item0', 'item1', 'item2', 'item3', 'item4', 'load more'],
    );
    assert.dom(page.list.loadMore.element).exists();

    await click(page.list.loadMore.element!);
    assert.dom(page.list.element).exists();
    assert.strictEqual(page.list.listItems.length, 11);
    assert.dom(page.list.listItems[0].element).exists();
    assert.dom(page.list.listItems[1].element).exists();
    assert.dom(page.list.listItems[6].element).exists();
    assert.dom(page.list.listItems[7].element).exists();
    assert.dom(page.list.listItems[11].element).doesNotExist();
    assert.deepEqual(
      page.list.listItems.map((item) => item.text),
      [
        'item0',
        'item1',
        'item2',
        'item3',
        'item4',
        'item5',
        'item6',
        'item7',
        'item8',
        'item9',
        'load more',
      ],
    );
    assert.dom(page.list.loadMore.element).exists();
  });
});
