import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { PageObject, selector } from 'fractal-page-object';
import type { PageObjectConstructor } from 'fractal-page-object';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

module('Integration | page object', function (hooks) {
  setupRenderingTest(hooks);

  test('page objects provide the correct root', async function (assert) {
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
    const s = <T extends PageObject>(
      name: string,
      Cls?: PageObjectConstructor<T>
    ): T => selector(`[data-name="${name}"]`, Cls);

    await render(hbs`
      <div data-name="one" class="div-one"/>
      <div data-name="two" class="div-two">
        <div data-name="three" class="div-three"/>
      </div>
    `);

    const Page = class extends PageObject {
      one = s('one');
      two = s(
        'two',
        class extends PageObject {
          three = s('three');
        }
      );
    };
    let page = new Page();

    assert.dom(page.one.element).hasClass('div-one');
    assert.dom(page.two.element).hasClass('div-two');
    assert.dom(page.two.three.element).hasClass('div-three');
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
        }
      );

      list = selector(
        '.list',
        class extends PageObject {
          listItems = selector('li', ListItem);
          loadMore = selector('.load-more');
        }
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
      ['item0', 'item1', 'item2', 'item3', 'item4', 'load more']
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
      ]
    );
    assert.dom(page.list.loadMore.element).exists();
  });
});
