import { describe, test, expect } from '@jest/globals';
import DOMQuery from '../-private/dom-query';

describe('DOMQuery', () => {
  describe('query() and queryAll()', () => {
    test('no root and no selector', () => {
      let query = new DOMQuery(null, '');
      expect(query.query()).toEqual(null);
      expect(query.queryAll()).toEqual([]);
    });

    test('no root and selector', () => {
      document.body.innerHTML = '<div></div>';

      let query = new DOMQuery(null, 'div');
      expect(query.query()).toEqual(null);
      expect(query.queryAll()).toEqual([]);
    });

    test('root and no selector', () => {
      document.body.innerHTML = `
        <div>
          <span></span>
        </div>
      `;
      let div = document.body.children[0];

      let query = new DOMQuery(div, '');
      expect(query.query()).toEqual(div);
      expect(query.queryAll()).toEqual([div]);
    });

    test('root and selector', () => {
      document.body.innerHTML = `
        <div>
          <span></span>
          <span></span>
        </div>
      `;
      let div = document.body.children[0];
      let [span1, span2] = Array.from(div!.children);

      let query = new DOMQuery(div, 'span');
      expect(query.query()).toEqual(span1);
      expect(query.queryAll()).toEqual([span1, span2]);
    });

    test('do not match outside the root', () => {
      document.body.innerHTML = `
        <span></span>
        <div>
          <span></span>
          <span></span>
        </div>
        <span></span>
      `;
      let div = document.body.children[1];
      let [span1, span2] = Array.from(div!.children);

      let query = new DOMQuery(div, 'span');
      expect(query.query()).toEqual(span1);
      expect(query.queryAll()).toEqual([span1, span2]);
    });
  });

  describe('createChild()', () => {
    describe('without index', () => {
      test('no root and no selector', () => {
        document.body.innerHTML = '<div></div>';

        let query = new DOMQuery(null, '').createChild('div', null);
        expect(query.root).toEqual(null);
        expect(query.selector).toEqual('div');
        expect(query.query()).toEqual(null);
        expect(query.queryAll()).toEqual([]);
      });

      test('no root and selector', () => {
        document.body.innerHTML = `
          <div>
            <span></span>
          </div>
        `;

        let query = new DOMQuery(null, 'div').createChild('span', null);
        expect(query.root).toEqual(null);
        expect(query.selector).toEqual('div span');
        expect(query.query()).toEqual(null);
        expect(query.queryAll()).toEqual([]);
      });

      test('root and no selector', () => {
        document.body.innerHTML = `
          <div>
            <span></span>
            <span></span>
          </div>
        `;
        let div = document.body.children[0];
        let [span1, span2] = Array.from(div.children);

        let query = new DOMQuery(div, '').createChild('span', null);
        expect(query.root).toEqual(div);
        expect(query.selector).toEqual('span');
        expect(query.query()).toEqual(span1);
        expect(query.queryAll()).toEqual([span1, span2]);
      });

      test('root and selector', () => {
        document.body.innerHTML = `
          <div>
            <span>
              <p></p>
            </span>
            <span>
              <p></p>
            </span>
          </div>
        `;
        let div = document.body.children[0];
        let [span1, span2] = Array.from(div.children);
        let p1 = span1.children[0];
        let p2 = span2.children[0];

        let query = new DOMQuery(div, 'span').createChild('p', null);
        expect(query.root).toEqual(div);
        expect(query.selector).toEqual('span p');
        expect(query.query()).toEqual(p1);
        expect(query.queryAll()).toEqual([p1, p2]);
      });
    });

    describe('with index', () => {
      test('no root and no selector', () => {
        document.body.innerHTML = '<div></div>';

        let query = new DOMQuery(null, '').createChild('div', 0);
        expect(query.root).toEqual(null);
        expect(query.selector).toEqual('');
        expect(query.query()).toEqual(null);
        expect(query.queryAll()).toEqual([]);
      });

      test('no root and selector', () => {
        document.body.innerHTML = `
          <div>
            <span></span>
          </div>
        `;

        let query = new DOMQuery(null, 'div').createChild('span', 0);
        expect(query.root).toEqual(null);
        expect(query.selector).toEqual('');
        expect(query.query()).toEqual(null);
        expect(query.queryAll()).toEqual([]);
      });

      test('root and no selector', () => {
        document.body.innerHTML = `
          <div>
            <span></span>
            <span></span>
          </div>
        `;
        let div = document.body.children[0];
        let [span1, span2] = Array.from(div.children);

        let parent = new DOMQuery(div, '');

        let query = parent.createChild('span', 0);
        expect(query.root).toEqual(span1);
        expect(query.selector).toEqual('');
        expect(query.query()).toEqual(span1);
        expect(query.queryAll()).toEqual([span1]);

        query = parent.createChild('span', 1);
        expect(query.root).toEqual(span2);
        expect(query.selector).toEqual('');
        expect(query.query()).toEqual(span2);
        expect(query.queryAll()).toEqual([span2]);

        query = parent.createChild('span', 2);
        expect(query.root).toEqual(null);
        expect(query.selector).toEqual('');
        expect(query.query()).toEqual(null);
        expect(query.queryAll()).toEqual([]);
      });

      test('root and selector', () => {
        document.body.innerHTML = `
          <div>
            <span>
              <p></p>
            </span>
            <span>
              <p></p>
            </span>
          </div>
        `;
        let div = document.body.children[0];
        let [span1, span2] = Array.from(div.children);
        let p1 = span1.children[0];
        let p2 = span2.children[0];

        let parent = new DOMQuery(div, 'span');

        let query = parent.createChild('p', 0);
        expect(query.root).toEqual(p1);
        expect(query.selector).toEqual('');
        expect(query.query()).toEqual(p1);
        expect(query.queryAll()).toEqual([p1]);

        query = parent.createChild('p', 1);
        expect(query.root).toEqual(p2);
        expect(query.selector).toEqual('');
        expect(query.query()).toEqual(p2);
        expect(query.queryAll()).toEqual([p2]);

        query = parent.createChild('p', 2);
        expect(query.root).toEqual(null);
        expect(query.selector).toEqual('');
        expect(query.query()).toEqual(null);
        expect(query.queryAll()).toEqual([]);
      });
    });
  });
});
