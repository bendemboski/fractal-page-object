<!-- omit in toc -->
# fractal-page-object

A lightweight page object implementation with a focus on simplicity and extensibility

<!-- omit in toc -->
## Table of Contents

- [Examples](#examples)
- [Why page objects?](#why-page-objects)
- [Usage](#usage)
  - [Mental Model](#mental-model)
    - [Page objects as lists](#page-objects-as-lists)
  - [Lazy evaluation](#lazy-evaluation)
  - [Extending](#extending)
  - [Re-use](#re-use)
  - [API](#api)
- [In Ember](#in-ember)
  - [Integrating with `qunit-dom` and `@ember/test-helpers`](#integrating-with-qunit-dom-and-embertest-helpers)
  - [`fractal-page-object` vs. `ember-cli-page-object`](#fractal-page-object-vs-ember-cli-page-object)
    - [Query-only](#query-only)
    - [Native syntax](#native-syntax)
    - [Lightweight (no jQuery)](#lightweight-no-jquery)
- [Why `fractal`?](#why-fractal)

## Examples

Define page object:

```javascript
import { PageObject, selector } from 'fractal-page-object';

class AlbumListPage extends PageObject {
  artistName = selector('.artist-name');
  albums = selector('.album', class extends PageObject {
    title = selector('.album-title');
    tracks = selector('.track', class extends PageObject {
      title = selector('.track-title');
    });
    
    play = selector('.play');
  });
}
let page = new AlbumListPage();
```

Using [qunit](https://qunitjs.com/):

```javascript
import { module, test } from 'qunit';

// Put your page object here

module('album list page', function() {
  test('it renders albums and tracks', function(assert) {
    // render page

    assert.equal(page.artistName.element.textContent, '"Weird Al" Yancovic');
    assert.equal(page.albums.length, 2);

    assert.equal(page.albums[0].title.element.textContent, 'Even Worse');
    assert.equal(page.albums[1].title.element.textContent, 'Bad Hair Day');
    assert.equal(page.albums[2].title.element.textContent, 'Mandatory Fun');

    let badHairDay = page.albums[1];

    assert.deepEqual(badHairDay.tracks.slice(0, 3).map((track) => track.element.textContent), [
      'Amish Paradise',
      'Everything You Know is Wrong',
      'Cavity Search'
    ]);
    assert.notOk(badHairDay.play.element.classList.contains('playing'));

    badHairDay.play.element.click();
    assert.ok(badHairDay.play.element.classList.contains('playing'));
  });
});
```

Or using [@ember/test-helpers](https://github.com/emberjs/ember-test-helpers) and [qunit-dom](https://github.com/simplabs/qunit-dom):

```javascript
import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';

// Put your page object here

module('album list page', function() {
  test('it renders albums and tracks (using Ember & qunit-dom)', function(assert) {
    await visit('/album-list');

    assert.dom(page.artistName.element).hasText('"Weird Al" Yancovic');
    assert.equal(page.albums.length, 2);

    assert.dom(page.albums[0].title.element).hasText('Even Worse');
    assert.dom(page.albums[1].title.element).hasText('Bad Hair Day');
    assert.dom(page.albums[2].title.element).hasText('Mandatory Fun');

    let badHairDay = page.albums[1];

    [
      'Amish Paradise',
      'Everything You Know is Wrong',
      'Cavity Search'
    ].forEach((title, i) => assert.dom(badHairDay.tracks[i].element).hasText(title));
    assert.dom(badHairDay.play.element).doesNotHaveClass('playing');

    await click(badHairDay.play.element);
    assert.dom(badHairDay.play.element).hasClass('playing');
  });
});
```

## Why page objects?

As you can see from the above example, they allow you to centralize your tests' knowledge of how your pages are laid out. This provides a number of benefits:

1. More concise and easier to write tests -- having a page object that declaratively lays out the elements of your pages and components that are important to testing makes it easier to write tests -- rather than picking through all the markup in an HTML template to find the class name for the element you want to interact with, you can look through a much more concise page object declaration with a clearly defined structure and explicit human-readable names.
2. Easier maintenance -- simple changes to your application like modifying a class name is a breeze, as it only requires making a single update to the page object describing that page or component, rather than searching-and-replacing through all of the tests that reference that class name. Even more complex refactors to a page's or component's HTML can often only require changes to the page object to keep the tests passing.
3. Typing -- since `fractal-page-object` is built on typescript, you can take advantage of typechecking and type-aware IDE features to aid your test writing, something that's impossible when just querying selectors for DOM elements.

## Usage

### Mental Model

The mental model for page objects is, at its core, a tree structure. Each node in the tree is a page object that represents a DOM query, and at any given time matches zero or more DOM elements. In their very simplest form, each page object can be thought of as equivalent to a CSS selector, e.g. consider:

```javascript
class WelcomePage extends PageObject {
  contactForm = selector('.contact-form', class extends PageObject {
    email = selector('.email');
    submit = selector('.submit');
  });
}
let page = new WelcomePage();
```

`page.contactForm` describes the list of DOM elements matched by `document.querySelectorAll('.contact-form')` (roughly -- see [setRoot()](#setroot)), while `page.contactForm.email` describes `document.querySelectorAll('.contact-form .email')` and `page.contactForm.submit` describes `document.querySelectorAll('.contact-form .submit')`.

Note the use of `querySelectorAll()` rather than `querySelector()` -- this is because, like CSS selectors, how you use page objects determines whether they resolve to the first matching element or all matching elements. Unlike CSS selectors, though, page objects can accommodate list indexing, analagous to the `:eq()` `jQuery` extension.

`selector()` also supports some strings that aren't valid CSS selectors, but can be used to build valid selectors, e.g. `> .email`. The rule is that a string passed to `selector()` is valid if it is itself a valid CSS selector, or if prepending `:scope ` to it would make it a valid CSS selector.

#### Page objects as lists

Page objects expose an array-like API -- they implement the index operator, the `Array` iteration methods such as `map()` and `find()`, and several other `Array` methods. The index operator always returns a page object, but one that is restricted to the element at the given index (if there is one).

```javascript
document.body.innerHTML = `
  <div id="div1"></div>
  <div id="div2"></div>
`;

class Page extends PageObject {
  divs = selector('div');
}
let page = new Page();

page.divs.element; // div1
page.divs.elements; // [div1, div2]
page.divs[0].element; // div1
page.divs[0].elements; // [div1]
page.divs[1].element; // div2
page.divs[1].elements; // [div2]
page.divs[2].element; // null
page.divs[2].elements; // []
```

The iteration methods execute the query and iterate over the results (wrapping in page objects), and therefore all page objects returned from the iterator have a single matching element. Extending the above example:

```javascript
page.divs.map((div) => div.id); // ['div1', 'div2']
page.divs.find((div) => div.id.endsWith('2')).element; // div2
```

Since the page objects act like selectors, the matching behavior is quite flexible:

```javascript
document.body.innerHTML = `
  <div>
    <span id="span1"></span>
  </div>
  <div>
    <span id="span2"></span>
    <span id="span3"></span>
  </div>
`;

class Page extends PageObject {
  divs = selector('div', class extends PageObject {
    spans = selector('span');    
  });
}
let page = new Page();

page.divs.spans.elements; // [span1, span2, span3]
page.divs[0].spans.elements; // [span1]
page.divs[1].spans.elements; // [span2, span3]
page.divs.spans[1].element; // span2
page.divs[0].spans[0].element; // span1
page.divs[1].spans[1].element; // span3
```

### Lazy evaluation

Page object nodes are lazy evaluated, meaning that they can be stored and will update dynamically:

```javascript
class Page extends PageObject {
  listItems = selector('li', class extends PageObject {
    image = selector('image');
  });
  loadButton = selector('.load');
}
let page = new Page();

let images = page.listItems.image;
images.length; // 0

page.loadButton.element.click(); // populates the DOM with list items
images.length; // 6
```

and this includes array indexing:

```javascript
class Page extends PageObject {
  listItems = selector('li', class extends PageObject {
    image = selector('image');
  });
  loadButton = selector('.load');
}
let page = new Page();

let thirdImage = listItems[2].image;
thirdImage.element; // null

page.loadButton.element.click(); // populates the DOM with list items
thirdImage.element; // non-null
```

### Extending

Page objects can be extended by adding any functionality to the `PageObject` subclass:

```javascript
class Page extends PageObject {
  listItems = selector('li', class extends PageObject {
    checkbox = selector('checkbox');

    get isSelected() {
      return this.checkbox.element.checked;
    }

    toggle() {
      this.checkbox.element.click();
    }
  });

  selectAll() {
    for (let item of this.listItems) {
      if (!item.isSelected) {
        item.toggle();
      }
    }
  }
}
```

### Re-use

To support testing of component-based applications, page objects can be reused as descendants of other page objects as well being root-level page objects. For example, consider a login form component that is used on a login page and on a purchase completion page:

```javascript
import { module, test } from 'qunit';
import { PageObject, selector } from 'fractal-page-object';

class LoginForm extends PageObject {
  username = selector('.username');
  password = selector('.password');
  submitButton = selector('[type="submit"]');
}

class LoginPage extends PageObject {
  createAccount = selector('.createAccount');
  loginForm = selector('.login-form', LoginForm);
}

class CompletePurchasePage extends PageObject {
  purchaseInfo = selector('.purchase-info');
  purchaseButton = selector('.purchase');

  loginModal = selector('.login-modal', {
    loginForm = selector('.login-form', LoginForm);
  });
}
```

`LoginForm` could be used to test the login form in isolation (e.g. in an Ember rendering test), and `LoginPage` and `CompletePurchasePage` could be used to test it along with the rest of the contents of the respective pages (e.g. in an Ember acceptance test). If the `LoginForm` is a component that always renders itself with the `login-form` class on its root element, then you might DRY up that class with a static property:

```javascript
class LoginForm extends PageObject {
  static selector = selector('.login-form', LoginForm);
}

class LoginPage extends PageObject {
  loginForm = LoginForm.selector;
}
```

### API

See [API.md](packages/fractal-page-object/API.md)

## In Ember

`fractal-page-object` was built with Ember and `qunit-dom` in mind, and is instrumented to detect when it's running in Ember tests and use the `@ember/test-helpers` testing root as its root element by default.

### Integrating with `qunit-dom` and `@ember/test-helpers`

Currently `fractal-page-object` works with `qunit-dom` and `@ember/test-helpers` because their APIs both accept a DOM `Element`. However, this doesn't allow for very helpful error messages, as there is no way to pass any information about the selector used to query the element. My hope is that the Ember community will be able to define an interface that both `qunit-dom` and `@ember/test-helpers` can support for allowing external DOM query implementations, which is fundamentally what `fractal-page-object` is, to supplement their existing support for selector-based queries and passing `Element`s. This would allow syntax like

```javascript
assert.dom(page.header).hasText('Welcome back!');
assert.dom(page.listItems).exists({ count: 3 });
assert.dom(page.listItems[1].title).hasClass('selected');
await click(page.loadMoreButton);
```

and allow better debug/error messages. See [this RFC](https://github.com/bendemboski/rfcs/blob/dom-query-interface/text/0726-dom-element-descriptor-interface.md) for a proposal for how this might work.

### `fractal-page-object` vs. `ember-cli-page-object`

There are several significant factors that differentiate `fractal-page-object` from `ember-cli-page-object` (aside from it not being tied to Ember). I love `ember-cli-page-object`, think it's an excellent library, and have been using it for years, so I hope this doesn't come across as casting shade. I thought the time was right to green-field something that leverages the latest Javascript features in the hopes of producing an evolution of the page object model with very clean ergonomics and flexible opportunities for integrating with other testing libraries.

#### Query-only

`fractal-page-object` has a tight focus on the core value of querying the DOM. All of its core functionality is built around that, taking as input a selector-based desciption of the relevant parts of the DOM and exposing as output native DOM `Element`s, which allows it to "plug in" to any tooling that works with DOM `Element`s. `ember-cli-page-object` aims to do more, providing a higher-level declarative API for reading information off the the DOM objects (such as attibutes, text content, visibility determinations, etc.), and providing its own set of DOM interaction helpers. My [hope](#integrating-with-qunit-dom-and-embertest-helpers) is that this will allow `fractal-page-object` to integrate very cleanly with existing tooling without duplicating significant portions of that tooling's functionality.

#### Native syntax

`fractal-page-object` uses proxies to enable native array syntax when dealing with lists of elements:

```javascript
// fractal-page-object
page.listItems[0].title;
// ember-cli-page-object
page.listItems.objectAt(0).title;
```

and uses ES6 classes as the basis of its declarative API, which enables modern features like getters, decorators, field initializers, etc.

#### Lightweight (no jQuery)

`fractal-page-object` has its own DOM query implementation that handles indexing into multi-element matches, and therefore does not need to rely on jQuery for the `:eq()` selector extension. In fact, `fractal-page-object` has no runtime dependencies.

## Why `fractal`?

Four reasons:

1. Naming things is hard
2. I like the word
3. It roughly describes the array-like behavior of page objects where the index operator returns a page object with the same shape, but representing only one element of the list
4. Naming things is hard
