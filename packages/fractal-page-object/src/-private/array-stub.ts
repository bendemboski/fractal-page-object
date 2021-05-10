/* istanbul ignore file */

/**
 * Helper type for array prototype stubbing
 *
 * @see {@link ArrayStub#map} etc.
 */
type WithElement<T> = T & { element: Element };

/**
 * Base class for {@link PageObject} that contains stub implementations of a
 * subset of array methods (the ones that produce a possibly useful value). The
 * actual functionality is handled by the proxy, the implementations aren't
 * important, these are just here for type checking.
 *
 * It really seems like there should be a better way to do this, but I can't
 * figure out how else to make PageObject subclasses look like arrays of
 * `WithElement<this>`.
 *
 * @private
 */
export default class ArrayStub {
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
  // `WithElement<this>`.
  //

  /**
   * @private
   */
  declare readonly length: number;
  /**
   * @private
   */
  declare pop: () => WithElement<this> | undefined;
  /**
   * @private
   */
  declare concat: (
    ...items:
      | ConcatArray<WithElement<this>>[]
      | (WithElement<this> | ConcatArray<WithElement<this>>)[]
      | (WithElement<this> | ConcatArray<WithElement<this>>)[]
  ) => WithElement<this>[];
  /**
   * @private
   */
  declare reverse: () => WithElement<this>[];
  /**
   * @private
   */
  declare shift: () => WithElement<this> | undefined;
  /**
   * @private
   */
  declare slice: (_start?: number, _end?: number) => WithElement<this>[];
  /**
   * @private
   */
  declare sort: (
    _compareFn?: (a: WithElement<this>, b: WithElement<this>) => number
  ) => this[];
  /**
   * @private
   */
  declare indexOf: (
    _searchElement: WithElement<this>,
    _fromIndex?: number
  ) => number;
  /**
   * @private
   */
  declare lastIndexOf: (
    _searchElement: WithElement<this>,
    _fromIndex?: number
  ) => number;
  /**
   * @private
   */
  declare every: (
    predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ) => boolean;
  /**
   * @private
   */
  declare some: (
    _predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ) => boolean;
  /**
   * @private
   */
  declare forEach: (
    _callbackfn: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => void,
    _thisArg?: any
  ) => void;
  /**
   * @private
   */
  declare map: <U>(
    _callbackfn: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => U,
    _thisArg?: any
  ) => U[];
  /**
   * @private
   */
  declare filter: (
    predicate: (
      value: WithElement<this>,
      index: number,
      array: WithElement<this>[]
    ) => unknown,
    thisArg?: any
  ) => WithElement<this>[];
  /**
   * @private
   */
  declare reduce: <U>(
    _callbackfn: (
      previousValue: U,
      currentValue: WithElement<this>,
      currentIndex: number,
      array: WithElement<this>[]
    ) => U,
    initialValue: U
  ) => U;
  /**
   * @private
   */
  declare reduceRight: <U>(
    _callbackfn: (
      previousValue: U,
      currentValue: WithElement<this>,
      currentIndex: number,
      array: WithElement<this>[]
    ) => U,
    initialValue: U
  ) => U;
  /**
   * @private
   */
  declare find: (
    predicate: (
      value: WithElement<this>,
      index: number,
      obj: WithElement<this>[]
    ) => unknown,
    thisArg?: any
  ) => WithElement<this> | undefined;
  /**
   * @private
   */
  declare findIndex: (
    _predicate: (
      value: WithElement<this>,
      index: number,
      obj: WithElement<this>[]
    ) => unknown,
    _thisArg?: any
  ) => number;
  /**
   * @private
   */
  declare includes: (
    _searchElement: WithElement<this>,
    _fromIndex?: number
  ) => boolean;
  /**
   * @private
   */
  declare [Symbol.iterator]: () => IterableIterator<WithElement<this>>;
  /**
   * @private
   */
  declare entries: () => IterableIterator<[number, WithElement<this>]>;
  /**
   * @private
   */
  declare keys: () => IterableIterator<number>;
  /**
   * @private
   */
  declare values: () => IterableIterator<WithElement<this>>;

  /**
   * @private
   */
  readonly [n: number]: this;
}
