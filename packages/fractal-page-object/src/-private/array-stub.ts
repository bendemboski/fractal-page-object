/* istanbul ignore file */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { WithElement } from './types';

/**
 * Base class for {@link PageObject} that contains stub implementations of a
 * subset of array methods (the ones that produce a possibly useful value). The
 * actual functionality is handled by the proxy, the implementations aren't
 * important, these are just here for type checking.
 *
 * It really seems like there should be a better way to do this, but I can't
 * figure out how else to make PageObject subclasses look like arrays of
 * `WithElement<this, ElementType>`.
 *
 * @private
 */
export default class ArrayStub<ElementType extends Element> {
  //
  // Array API
  //
  // Here we provide typed stub implementations for a subset of array methods
  // (the ones that produce a possibly useful value). The actual functionality
  // is handled by the proxy, the implementations aren't important, these are
  // just here for type checking.
  //
  // It really seems like there should be a better way to do this, but I can't
  // figure out how else to make PageObject subclasses look like arrays of
  // `WithElement<this, ElementType>`.
  //

  /**
   * @private
   */
  declare readonly length: number;
  /**
   * @private
   */
  declare pop: () => WithElement<this, ElementType> | undefined;
  /**
   * @private
   */
  declare reverse: () => WithElement<this, ElementType>[];
  /**
   * @private
   */
  declare shift: () => WithElement<this, ElementType> | undefined;
  /**
   * @private
   */
  declare slice: (
    _start?: number,
    _end?: number,
  ) => WithElement<this, ElementType>[];
  /**
   * @private
   */
  declare sort: (
    _compareFn?: (
      a: WithElement<this, ElementType>,
      b: WithElement<this, ElementType>,
    ) => number,
  ) => this[];
  /**
   * @private
   */
  declare every: (
    predicate: (
      value: WithElement<this, ElementType>,
      index: number,
      array: WithElement<this, ElementType>[],
    ) => unknown,
    _thisArg?: any,
  ) => boolean;
  /**
   * @private
   */
  declare some: (
    _predicate: (
      value: WithElement<this, ElementType>,
      index: number,
      array: WithElement<this, ElementType>[],
    ) => unknown,
    _thisArg?: any,
  ) => boolean;
  /**
   * @private
   */
  declare forEach: (
    _callbackfn: (
      value: WithElement<this, ElementType>,
      index: number,
      array: WithElement<this, ElementType>[],
    ) => void,
    _thisArg?: any,
  ) => void;
  /**
   * @private
   */
  declare map: <U>(
    _callbackfn: (
      value: WithElement<this, ElementType>,
      index: number,
      array: WithElement<this, ElementType>[],
    ) => U,
    _thisArg?: any,
  ) => U[];
  /**
   * @private
   */
  declare filter: (
    predicate: (
      value: WithElement<this, ElementType>,
      index: number,
      array: WithElement<this, ElementType>[],
    ) => unknown,
    thisArg?: any,
  ) => WithElement<this, ElementType>[];
  /**
   * @private
   */
  declare reduce: <U>(
    _callbackfn: (
      previousValue: U,
      currentValue: WithElement<this, ElementType>,
      currentIndex: number,
      array: WithElement<this, ElementType>[],
    ) => U,
    initialValue: U,
  ) => U;
  /**
   * @private
   */
  declare reduceRight: <U>(
    _callbackfn: (
      previousValue: U,
      currentValue: WithElement<this, ElementType>,
      currentIndex: number,
      array: WithElement<this, ElementType>[],
    ) => U,
    initialValue: U,
  ) => U;
  /**
   * @private
   */
  declare find: (
    predicate: (
      value: WithElement<this, ElementType>,
      index: number,
      obj: WithElement<this, ElementType>[],
    ) => unknown,
    thisArg?: any,
  ) => WithElement<this, ElementType> | undefined;
  /**
   * @private
   */
  declare findIndex: (
    _predicate: (
      value: WithElement<this, ElementType>,
      index: number,
      obj: WithElement<this, ElementType>[],
    ) => unknown,
    _thisArg?: any,
  ) => number;
  /**
   * @private
   */
  declare [Symbol.iterator]: () => IterableIterator<
    WithElement<this, ElementType>
  >;
  /**
   * @private
   */
  declare entries: () => IterableIterator<
    [number, WithElement<this, ElementType>]
  >;
  /**
   * @private
   */
  declare keys: () => IterableIterator<number>;
  /**
   * @private
   */
  declare values: () => IterableIterator<WithElement<this, ElementType>>;

  /**
   * @private
   */
  readonly [n: number]: this;
}
