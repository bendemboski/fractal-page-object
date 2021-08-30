/* global QUnit, FractalPageObject */
const { module, test } = QUnit;
const { PageObject, selector, setRoot } = FractalPageObject;

module('page object', function(hooks) {
  let testContainer;

  hooks.beforeEach(function() {
    testContainer = document.querySelector('#qunit-fixture');
    setRoot(testContainer);
  });

  test('it respects the root', function(assert) {
    class Page extends PageObject {
      target = selector('[data-target]')
    }
    let page = new Page();
    assert.equal(page.element, testContainer);

    let div = document.createElement('div');
    div.setAttribute('data-target', '');

    document.body.append(div);
    try {
      testContainer.innerHTML = '<div data-target>Hello world</div>';
      assert.dom(page.target).exists({ count: 1});
      assert.dom(page.target).hasText('Hello world');
    } finally {
      div.remove();
    }
  });

  test('smoke test', async function(assert) {
    class ListItem extends PageObject {
      get text() {
        return this.element?.textContent;
      }
    }

    class Page extends PageObject {
      header = selector('.header', class extends PageObject {
        title = selector('.title')
        showList = selector('button')
      })

      list = selector('.list', class extends PageObject {
        listItems = selector('li', ListItem)
        loadMore = selector('.load-more')
      })
    }
    let page = new Page();

    testContainer.innerHTML = `
      <div class="header">
        <div class="title">List of stuff</div>
        <button type="button" data-button>Load list</button>
      </div>
    `;

    function loadMore() {
      let list = testContainer.querySelector('.list');
      if (!list) {
        // create list
        list = document.createElement('ul');
        list.classList.add('list');
        testContainer.append(list);

        // create load more item
        let loadMoreEl = document.createElement('li');
        loadMoreEl.classList.add('load-more');
        loadMoreEl.textContent = 'load more';
        loadMoreEl.addEventListener('click', loadMore);
        list.append(loadMoreEl);
      }

      // add 5 list items
      let itemCount = list.children.length - 1;
      for (let i = itemCount; i < itemCount + 5; i += 1) {
        let li = document.createElement('li');
        li.textContent = `item${i}`;
        // before the load more item
        list.insertBefore(li, list.lastElementChild);
      }
    }

    let button = testContainer.querySelector('[data-button]');
    button.addEventListener('click', loadMore);

    assert.dom(page.header.title).hasText('List of stuff');
    assert.dom(page.list).doesNotExist();
    assert.equal(page.list.listItems.length, 0);
    assert.dom(page.list.listItems[0]).doesNotExist();
    assert.dom(page.list.loadMore).doesNotExist();

    page.header.showList.element.click();
    assert.dom(page.list).exists();
    assert.equal(page.list.listItems.length, 6);
    assert.dom(page.list.listItems[0]).exists();
    assert.dom(page.list.listItems[1]).exists();
    assert.dom(page.list.listItems[6]).doesNotExist();
    assert.deepEqual(
      page.list.listItems.map(item => item.text),
      ['item0', 'item1', 'item2', 'item3', 'item4', 'load more']
    );
    assert.dom(page.list.loadMore).exists();

    page.list.loadMore.element.click();
    assert.dom(page.list).exists();
    assert.equal(page.list.listItems.length, 11);
    assert.dom(page.list.listItems[0]).exists();
    assert.dom(page.list.listItems[1]).exists();
    assert.dom(page.list.listItems[6]).exists();
    assert.dom(page.list.listItems[7]).exists();
    assert.dom(page.list.listItems[11]).doesNotExist();
    assert.deepEqual(
      page.list.listItems.map(item => item.text),
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
        'load more'
      ]
    );
    assert.dom(page.list.loadMore).exists();
  });
});
