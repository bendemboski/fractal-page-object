import { describe, beforeEach, test, expect } from '@jest/globals';
import DOMQuery from '../-private/dom-query';

describe('DOMQuery', () => {
  let root = document.querySelector('div');
  let span1: Element;
  let span2: Element;
  let strong1: Element;
  let strong2: Element;
  let strong3: Element;
  let strong4: Element;
  let rootQuery: DOMQuery;

  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <span>
          <strong></strong>
          <strong></strong>
        </span>
        <span>
          <strong></strong>
        </span>
        <strong></strong>
      </div>
      <span>
        <strong></strong>
      </span>
      <span>
        <strong></strong>
      </span>
      <strong></strong>
    `;

    root = document.querySelector('div');
    [span1, span2, strong4] = Array.from(root!.children);
    [strong1, strong2] = Array.from(span1!.children);
    [strong3] = Array.from(span2!.children);

    rootQuery = new DOMQuery(root);
  });

  test('never matches with a null root', () => {
    let query = new DOMQuery(null);
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
      span2,
    ]);
    expect(rootQuery.createChild('span', 0).queryAll()).toEqual([span1]);
    expect(rootQuery.createChild('span', 1).queryAll()).toEqual([span2]);
    expect(rootQuery.createChild('span', 2).queryAll()).toEqual([]);

    expect(rootQuery.createChild('strong', null).queryAll()).toEqual([
      strong1,
      strong2,
      strong3,
      strong4,
    ]);
    expect(rootQuery.createChild('strong', 0).queryAll()).toEqual([strong1]);
    expect(rootQuery.createChild('strong', 1).queryAll()).toEqual([strong2]);
    expect(rootQuery.createChild('strong', 2).queryAll()).toEqual([strong3]);
    expect(rootQuery.createChild('strong', 3).queryAll()).toEqual([strong4]);
    expect(rootQuery.createChild('strong', 4).queryAll()).toEqual([]);

    expect(
      rootQuery.createChild('span', null).createChild('strong', null).queryAll()
    ).toEqual([strong1, strong2, strong3]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 0).queryAll()
    ).toEqual([strong1]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 1).queryAll()
    ).toEqual([strong2]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 2).queryAll()
    ).toEqual([strong3]);
    expect(
      rootQuery.createChild('span', null).createChild('strong', 3).queryAll()
    ).toEqual([]);

    expect(
      rootQuery.createChild('span', 0).createChild('strong', null).queryAll()
    ).toEqual([strong1, strong2]);
    expect(
      rootQuery.createChild('span', 1).createChild('strong', null).queryAll()
    ).toEqual([strong3]);
    expect(
      rootQuery.createChild('span', 2).createChild('strong', null).queryAll()
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
    expect(child.queryAll()).toEqual([span1, span2]);

    // selector doesn't match
    child = rootQuery.createChild('section', null);
    expect(child.selectorArray.toString()).toEqual('section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + index', () => {
    // selector & index match
    let child = rootQuery.createChild('span', 0);
    expect(child.selectorArray.toString()).toEqual('span[0]');
    expect(child.query()).toEqual(span1);
    expect(child.queryAll()).toEqual([span1]);

    child = rootQuery.createChild('span', 1);
    expect(child.selectorArray.toString()).toEqual('span[1]');
    expect(child.query()).toEqual(span2);
    expect(child.queryAll()).toEqual([span2]);

    // index does not match
    child = rootQuery.createChild('span', 2);
    expect(child.selectorArray.toString()).toEqual('span[2]');
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
    expect(child.queryAll()).toEqual([strong1, strong2, strong3]);

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

  test('root + selector + index + selector', () => {
    // matches
    let child = rootQuery.createChild('span', 0).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('span[0] strong');
    expect(child.query()).toEqual(strong1);
    expect(child.queryAll()).toEqual([strong1, strong2]);

    child = rootQuery.createChild('span', 1).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('span[1] strong');
    expect(child.query()).toEqual(strong3);
    expect(child.queryAll()).toEqual([strong3]);

    child = rootQuery.createChild('span', 2).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('span[2] strong');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // child selector doesn't match
    child = rootQuery.createChild('span', 0).createChild('section', null);
    expect(child.selectorArray.toString()).toEqual('span[0] section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index doesn't match
    child = rootQuery.createChild('span', 2).createChild('section', null);
    expect(child.selectorArray.toString()).toEqual('span[2] section');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent selector doesn't match
    child = rootQuery.createChild('section', 0).createChild('strong', null);
    expect(child.selectorArray.toString()).toEqual('section[0] strong');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);
  });

  test('root + selector + selector + index', () => {
    // matches
    let child = rootQuery.createChild('span', null).createChild('strong', 0);
    expect(child.selectorArray.toString()).toEqual('span strong[0]');
    expect(child.query()).toEqual(strong1);
    expect(child.queryAll()).toEqual([strong1]);

    child = rootQuery.createChild('span', null).createChild('strong', 1);
    expect(child.selectorArray.toString()).toEqual('span strong[1]');
    expect(child.query()).toEqual(strong2);
    expect(child.queryAll()).toEqual([strong2]);

    child = rootQuery.createChild('span', null).createChild('strong', 2);
    expect(child.selectorArray.toString()).toEqual('span strong[2]');
    expect(child.query()).toEqual(strong3);
    expect(child.queryAll()).toEqual([strong3]);

    // child index doesn't match
    child = rootQuery.createChild('span', null).createChild('strong', 3);
    expect(child.selectorArray.toString()).toEqual('span strong[3]');
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

    child = rootQuery.createChild('span', 0).createChild('strong', 1);
    expect(child.selectorArray.toString()).toEqual('span[0] strong[1]');
    expect(child.query()).toEqual(strong2);
    expect(child.queryAll()).toEqual([strong2]);

    child = rootQuery.createChild('span', 1).createChild('strong', 0);
    expect(child.selectorArray.toString()).toEqual('span[1] strong[0]');
    expect(child.query()).toEqual(strong3);
    expect(child.queryAll()).toEqual([strong3]);

    // child index doesn't match
    child = rootQuery.createChild('span', 0).createChild('strong', 2);
    expect(child.selectorArray.toString()).toEqual('span[0] strong[2]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    child = rootQuery.createChild('span', 1).createChild('strong', 1);
    expect(child.selectorArray.toString()).toEqual('span[1] strong[1]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // child selector doesn't match
    child = rootQuery.createChild('span', 0).createChild('section', 0);
    expect(child.selectorArray.toString()).toEqual('span[0] section[0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index doesn't match
    child = rootQuery.createChild('span', 2).createChild('strong', 0);
    expect(child.selectorArray.toString()).toEqual('span[2] strong[0]');
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

    child = rootQuery.createChild('span', 1).createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('span[1][0]');
    expect(child.query()).toEqual(span2);
    expect(child.queryAll()).toEqual([span2]);

    // child index is non-zero
    child = rootQuery.createChild('span', 0).createChild('', 1);
    expect(child.selectorArray.toString()).toEqual('span[0][1]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index doesn't match
    child = rootQuery.createChild('span', 2).createChild('', 0);
    expect(child.selectorArray.toString()).toEqual('span[2][0]');
    expect(child.query()).toEqual(null);
    expect(child.queryAll()).toEqual([]);

    // parent index doesn't match and child index is non-zero
    child = rootQuery.createChild('span', 2).createChild('', 1);
    expect(child.selectorArray.toString()).toEqual('span[2][1]');
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
});
