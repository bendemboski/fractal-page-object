import { describe, beforeEach, test, expect } from 'vitest';
import DOMQuery from '../-private/dom-query';

describe('DOMQuery', () => {
  let root = document.querySelector('div');
  let span1: Element;
  let span2: Element;
  let nestedSpan1: Element;
  let nestedSpan2: Element;
  let strong1: Element;
  let strong2: Element;
  let strong3: Element;
  let strong4: Element;
  let nestedStrong1: Element;
  let nestedStrong2: Element;
  let nestedStrong3: Element;
  let nestedStrong4: Element;
  let nestedStrong5: Element;
  let rootQuery: DOMQuery;

  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <span id="span1">
          <strong id="strong1">
            <strong id="nestedStrong1"></strong>
          </strong>
          <strong id="strong2">
            <strong id="nestedStrong2"></strong>
          </strong>
          <span id="nestedSpan1">
            <strong id="nestedStrong3"></strong>
          </span>
        </span>
        <span id="span2">
          <strong id="strong3">
            <strong id="nestedStrong4"></strong>
          </strong>
          <span id="nestedSpan2"></span>
        </span>
        <strong id="strong4">
          <strong id="nestedStrong5"></strong>        
        </strong>
      </div>
      <span>
        <strong></strong>
      </span>
      <span>
        <strong></strong>
      </span>
      <strong></strong>
    `;

    root = document.querySelector('div')!;
    span1 = root.querySelector('#span1')!;
    span2 = root.querySelector('#span2')!;
    nestedSpan1 = root.querySelector('#nestedSpan1')!;
    nestedSpan2 = root.querySelector('#nestedSpan2')!;
    strong1 = root.querySelector('#strong1')!;
    strong2 = root.querySelector('#strong2')!;
    strong3 = root.querySelector('#strong3')!;
    strong4 = root.querySelector('#strong4')!;
    nestedStrong1 = root.querySelector('#nestedStrong1')!;
    nestedStrong2 = root.querySelector('#nestedStrong2')!;
    nestedStrong3 = root.querySelector('#nestedStrong3')!;
    nestedStrong4 = root.querySelector('#nestedStrong4')!;
    nestedStrong5 = root.querySelector('#nestedStrong5')!;

    rootQuery = new DOMQuery(root);
  });

  test('never matches with a null root', () => {
    const query = new DOMQuery(null);
    expect(query.query()).toEqual(null);
    expect(query.queryAll()).toEqual([]);

    let child = query.createChild('div', null);
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    child = query.createChild('span', null);
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    child = query.createChild('span', 0);
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('it only matches in the root', () => {
    expect(rootQuery.createChild('span', null).queryAll()).toEqual([
      span1,
      nestedSpan1,
      span2,
      nestedSpan2,
    ]);
    expect(rootQuery.createChild('span', 0).queryAll()).toEqual([span1]);
    expect(rootQuery.createChild('span', 1).queryAll()).toEqual([nestedSpan1]);
    expect(rootQuery.createChild('span', 2).queryAll()).toEqual([span2]);
    expect(rootQuery.createChild('span', 3).queryAll()).toEqual([nestedSpan2]);
    expect(rootQuery.createChild('span', 4).queryAll()).toEqual([]);

    expect(rootQuery.createChild('strong', null).queryAll()).toEqual([
      strong1,
      nestedStrong1,
      strong2,
      nestedStrong2,
      nestedStrong3,
      strong3,
      nestedStrong4,
      strong4,
      nestedStrong5,
    ]);
    expect(rootQuery.createChild('strong', 0).queryAll()).toEqual([strong1]);
    expect(rootQuery.createChild('strong', 1).queryAll()).toEqual([
      nestedStrong1,
    ]);
    expect(rootQuery.createChild('strong', 2).queryAll()).toEqual([strong2]);
    expect(rootQuery.createChild('strong', 3).queryAll()).toEqual([
      nestedStrong2,
    ]);
    expect(rootQuery.createChild('strong', 4).queryAll()).toEqual([
      nestedStrong3,
    ]);
    expect(rootQuery.createChild('strong', 5).queryAll()).toEqual([strong3]);
    expect(rootQuery.createChild('strong', 6).queryAll()).toEqual([
      nestedStrong4,
    ]);
    expect(rootQuery.createChild('strong', 7).queryAll()).toEqual([strong4]);
    expect(rootQuery.createChild('strong', 8).queryAll()).toEqual([
      nestedStrong5,
    ]);
    expect(rootQuery.createChild('strong', 9).queryAll()).toEqual([]);

    expect(
      rootQuery
        .createChild('span', null)
        .createChild('strong', null)
        .queryAll(),
    ).toEqual([
      strong1,
      nestedStrong1,
      strong2,
      nestedStrong2,
      nestedStrong3,
      strong3,
      nestedStrong4,
    ]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 0).queryAll(),
    ).toEqual([strong1]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 1).queryAll(),
    ).toEqual([nestedStrong1]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 2).queryAll(),
    ).toEqual([strong2]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 3).queryAll(),
    ).toEqual([nestedStrong2]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 4).queryAll(),
    ).toEqual([nestedStrong3]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 5).queryAll(),
    ).toEqual([strong3]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 6).queryAll(),
    ).toEqual([nestedStrong4]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 7).queryAll(),
    ).toEqual([]);

    expect(
      rootQuery.createChild('span', 0).createChild('strong', null).queryAll(),
    ).toEqual([strong1, nestedStrong1, strong2, nestedStrong2, nestedStrong3]);
    expect(
      rootQuery.createChild('span', 2).createChild('strong', null).queryAll(),
    ).toEqual([strong3, nestedStrong4]);
    expect(
      rootQuery.createChild('span', 3).createChild('strong', null).queryAll(),
    ).toEqual([]);
  });

  test('root', () => {
    expect(rootQuery.selectorArray.toString()).toEqual('');
    expect(rootQuery.query()).toEqual(root);
    expect(rootQuery.queryAll()).toEqual([root]);
  });

  test('root + index', () => {
    // 0 matches root
    let child = rootQuery.createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('[0]');
    expect(child.query()).toEqual(root);
    expect(child.queryAll()).toEqual([root]);

    // non-0 doesn't match
    child = rootQuery.createChild('', 1);
    expect(child.selectorArray.toString()).toEqual('[1]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    child = rootQuery.createChild('', 2);
    expect(child.selectorArray.toString()).toEqual('[2]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector', () => {
    // selector matches
    let child = rootQuery.createChild('span', null);
    expect(child.selectorArray.toString()).toEqual('span');
    expect(child.query()).toEqual(span1);
    expect(child.queryAll()).toEqual([span1, nestedSpan1, span2, nestedSpan2]);

    // selector doesn't match
    child = rootQuery.createChild('section', null);
    expect(child.selectorArray.toString()).toEqual('section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + scoped selector', () => {
    // selector matches
    let child = rootQuery.createChild('> span', null);
    expect(child.selectorArray.toString()).toEqual('> span');
    expect(child.query()).toEqual(span1);
    expect(child.queryAll()).toEqual([span1, span2]);

    // selector doesn't match
    child = rootQuery.createChild('> section', null);
    expect(child.selectorArray.toString()).toEqual('> section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + index', () => {
    // selector & index match
    let child = rootQuery.createChild('span', 0);
    expect(child.selectorArray.toString()).toEqual('span[0]');
    expect(child.query()).toEqual(span1);
    expect(child.queryAll()).toEqual([span1]);

    child = rootQuery.createChild('span', 2);
    expect(child.selectorArray.toString()).toEqual('span[2]');
    expect(child.query()).toEqual(span2);
    expect(child.queryAll()).toEqual([span2]);

    // index does not match
    child = rootQuery.createChild('span', 4);
    expect(child.selectorArray.toString()).toEqual('span[4]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // selector does not match
    child = rootQuery.createChild('section', 0);
    expect(child.selectorArray.toString()).toEqual('section[0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + selector', () => {
    // both selectors match
    let child = rootQuery.createChild('span', null).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('span strong');
    expect(child.query()).toEqual(strong1);
    expect(child.queryAll()).toEqual([
      strong1,
      nestedStrong1,
      strong2,
      nestedStrong2,
      nestedStrong3,
      strong3,
      nestedStrong4,
    ]);

    // child selector doesn't match
    child = rootQuery.createChild('span', null).createChild('section', null);
    expect(child.selectorArray.toString()).toEqual('span section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent selector doesn't match
    child = rootQuery.createChild('section', null).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('section strong');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + scoped selector', () => {
    // both selectors match
    let child = rootQuery
      .createChild('span', null)
      .createChild('> strong', null);
    expect(child.selectorArray.toString()).toEqual('span > strong');
    expect(child.query()).toEqual(strong1);
    expect(child.queryAll()).toEqual([
      strong1,
      strong2,
      nestedStrong3,
      strong3,
    ]);

    // child selector doesn't match
    child = rootQuery.createChild('span', null).createChild('> section', null);
    expect(child.selectorArray.toString()).toEqual('span > section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent selector doesn't match
    child = rootQuery
      .createChild('section', null)
      .createChild('> strong', null);
    expect(child.selectorArray.toString()).toEqual('section > strong');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + index + selector', () => {
    // matches
    let child = rootQuery.createChild('span', 0).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('span[0] strong');
    expect(child.query()).toEqual(strong1);
    expect(child.queryAll()).toEqual([
      strong1,
      nestedStrong1,
      strong2,
      nestedStrong2,
      nestedStrong3,
    ]);

    child = rootQuery.createChild('span', 2).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('span[2] strong');
    expect(child.query()).toEqual(strong3);
    expect(child.queryAll()).toEqual([strong3, nestedStrong4]);

    child = rootQuery.createChild('span', 4).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('span[4] strong');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // child selector doesn't match
    child = rootQuery.createChild('span', 0).createChild('section', null);
    expect(child.selectorArray.toString()).toEqual('span[0] section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index doesn't match
    child = rootQuery.createChild('span', 4).createChild('section', null);
    expect(child.selectorArray.toString()).toEqual('span[4] section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent selector doesn't match
    child = rootQuery.createChild('section', 0).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('section[0] strong');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + index + scoped selector', () => {
    // matches
    let child = rootQuery.createChild('span', 0).createChild('> strong', null);
    expect(child.selectorArray.toString()).toEqual('span[0] > strong');
    expect(child.query()).toEqual(strong1);
    expect(child.queryAll()).toEqual([strong1, strong2]);

    child = rootQuery.createChild('span', 2).createChild('> strong', null);
    expect(child.selectorArray.toString()).toEqual('span[2] > strong');
    expect(child.query()).toEqual(strong3);
    expect(child.queryAll()).toEqual([strong3]);

    child = rootQuery.createChild('span', 3).createChild('> strong', null);
    expect(child.selectorArray.toString()).toEqual('span[3] > strong');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // child selector doesn't match
    child = rootQuery.createChild('span', 0).createChild('> section', null);
    expect(child.selectorArray.toString()).toEqual('span[0] > section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index doesn't match
    child = rootQuery.createChild('span', 2).createChild('> section', null);
    expect(child.selectorArray.toString()).toEqual('span[2] > section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent selector doesn't match
    child = rootQuery.createChild('section', 0).createChild('> strong', null);
    expect(child.selectorArray.toString()).toEqual('section[0] > strong');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + selector + index', () => {
    // matches
    let child = rootQuery.createChild('span', null).createChild('strong', 0);
    expect(child.selectorArray.toString()).toEqual('span strong[0]');
    expect(child.query()).toEqual(strong1);
    expect(child.queryAll()).toEqual([strong1]);

    child = rootQuery.createChild('span', null).createChild('strong', 2);
    expect(child.selectorArray.toString()).toEqual('span strong[2]');
    expect(child.query()).toEqual(strong2);
    expect(child.queryAll()).toEqual([strong2]);

    child = rootQuery.createChild('span', null).createChild('strong', 5);
    expect(child.selectorArray.toString()).toEqual('span strong[5]');
    expect(child.query()).toEqual(strong3);
    expect(child.queryAll()).toEqual([strong3]);

    // child index doesn't match
    child = rootQuery.createChild('span', null).createChild('strong', 9);
    expect(child.selectorArray.toString()).toEqual('span strong[9]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // child selector doesn't match
    child = rootQuery.createChild('span', null).createChild('section', 0);
    expect(child.selectorArray.toString()).toEqual('span section[0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent selector doesn't match
    child = rootQuery.createChild('section', null).createChild('strong', 0);
    expect(child.selectorArray.toString()).toEqual('section strong[0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + index + selector + index', () => {
    // matches
    let child = rootQuery.createChild('span', 0).createChild('strong', 0);
    expect(child.selectorArray.toString()).toEqual('span[0] strong[0]');
    expect(child.query()).toEqual(strong1);
    expect(child.queryAll()).toEqual([strong1]);

    child = rootQuery.createChild('span', 0).createChild('strong', 2);
    expect(child.selectorArray.toString()).toEqual('span[0] strong[2]');
    expect(child.query()).toEqual(strong2);
    expect(child.queryAll()).toEqual([strong2]);

    child = rootQuery.createChild('span', 2).createChild('strong', 0);
    expect(child.selectorArray.toString()).toEqual('span[2] strong[0]');
    expect(child.query()).toEqual(strong3);
    expect(child.queryAll()).toEqual([strong3]);

    // child index doesn't match
    child = rootQuery.createChild('span', 0).createChild('strong', 5);
    expect(child.selectorArray.toString()).toEqual('span[0] strong[5]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    child = rootQuery.createChild('span', 2).createChild('strong', 2);
    expect(child.selectorArray.toString()).toEqual('span[2] strong[2]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // child selector doesn't match
    child = rootQuery.createChild('span', 0).createChild('section', 0);
    expect(child.selectorArray.toString()).toEqual('span[0] section[0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index doesn't match
    child = rootQuery.createChild('span', 4).createChild('strong', 0);
    expect(child.selectorArray.toString()).toEqual('span[4] strong[0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent selector doesn't match
    child = rootQuery.createChild('section', 0).createChild('strong', 0);
    expect(child.selectorArray.toString()).toEqual('section[0] strong[0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + index + index', () => {
    // matches
    let child = rootQuery.createChild('', 0).createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('[0][0]');
    expect(child.query()).toEqual(root);
    expect(child.queryAll()).toEqual([root]);

    // child index is non-zero
    child = rootQuery.createChild('', 0).createChild('', 1);
    expect(child.selectorArray.toString()).toEqual('[0][1]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index is non-zero
    child = rootQuery.createChild('', 1).createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('[1][0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // both are non-zero
    child = rootQuery.createChild('', 1).createChild('', 1);
    expect(child.selectorArray.toString()).toEqual('[1][1]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + index + index', () => {
    // matches
    let child = rootQuery.createChild('span', 0).createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('span[0][0]');
    expect(child.query()).toEqual(span1);
    expect(child.queryAll()).toEqual([span1]);

    child = rootQuery.createChild('span', 2).createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('span[2][0]');
    expect(child.query()).toEqual(span2);
    expect(child.queryAll()).toEqual([span2]);

    // child index is non-zero
    child = rootQuery.createChild('span', 0).createChild('', 1);
    expect(child.selectorArray.toString()).toEqual('span[0][1]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index doesn't match
    child = rootQuery.createChild('span', 5).createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('span[5][0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index doesn't match and child index is non-zero
    child = rootQuery.createChild('span', 5).createChild('', 1);
    expect(child.selectorArray.toString()).toEqual('span[5][1]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // selector doesn't match
    child = rootQuery.createChild('section', 0).createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('section[0][0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    child = rootQuery.createChild('section', 0).createChild('', 1);
    expect(child.selectorArray.toString()).toEqual('section[0][1]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    child = rootQuery.createChild('section', 1).createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('section[1][0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    child = rootQuery.createChild('section', 1).createChild('', 1);
    expect(child.selectorArray.toString()).toEqual('section[1][1]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + scoped selector + scoped selector', () => {
    // matches
    let child = rootQuery
      .createChild('> span', null)
      .createChild('> strong', null);
    expect(child.selectorArray.toString()).toEqual('> span > strong');
    expect(child.query()).toEqual(strong1);
    expect(child.queryAll()).toEqual([strong1, strong2, strong3]);

    // parent selector doesn't match
    child = rootQuery
      .createChild('> section', null)
      .createChild('> strong', null);
    expect(child.selectorArray.toString()).toEqual('> section > strong');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // child selector doesn't match
    child = rootQuery
      .createChild('> span', null)
      .createChild('> section', null);
    expect(child.selectorArray.toString()).toEqual('> span > section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('it works with a shadow root', () => {
    const shadowSpan1 = document.createElement('span');
    shadowSpan1.id = 'shadowSpan1';

    const shadowSpan2 = document.createElement('span');
    shadowSpan2.id = 'shadowSpan2';

    span1.attachShadow({ mode: 'open' }).append(shadowSpan1, shadowSpan2);

    const shadowQuery = new DOMQuery(span1.shadowRoot);
    expect(shadowQuery.query()).toEqual(null);
    expect(shadowQuery.queryAll()).toEqual([]);

    let child = shadowQuery.createChild('span', null);
    expect(child.query()).toEqual(shadowSpan1);
    expect(child.queryAll()).toEqual([shadowSpan1, shadowSpan2]);

    child = shadowQuery.createChild('span', 1);
    expect(child.query()).toEqual(shadowSpan2);
    expect(child.queryAll()).toEqual([shadowSpan2]);
  });
});
