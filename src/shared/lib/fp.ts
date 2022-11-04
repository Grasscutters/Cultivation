type Func<R = any> = (...args: any[]) => R;

interface Compose {
  <V0, T1>(fn0: (x0: V0) => T1): (x0: V0) => T1;
  <V0, V1, T1>(fn0: (x0: V0, x1: V1) => T1): (x0: V0, x1: V1) => T1;
  <V0, V1, V2, T1>(fn0: (x0: V0, x1: V1, x2: V2) => T1): (
    x0: V0,
    x1: V1,
    x2: V2
  ) => T1;

  <V0, T1, T2>(fn1: (x: T1) => T2, fn0: (x0: V0) => T1): (x0: V0) => T2;
  <V0, V1, T1, T2>(fn1: (x: T1) => T2, fn0: (x0: V0, x1: V1) => T1): (
    x0: V0,
    x1: V1
  ) => T2;
  <V0, V1, V2, T1, T2>(
    fn1: (x: T1) => T2,
    fn0: (x0: V0, x1: V1, x2: V2) => T1
  ): (x0: V0, x1: V1, x2: V2) => T2;

  <V0, T1, T2, T3>(
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x: V0) => T1
  ): (x: V0) => T3;
  <V0, V1, T1, T2, T3>(
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x0: V0, x1: V1) => T1
  ): (x0: V0, x1: V1) => T3;
  <V0, V1, V2, T1, T2, T3>(
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x0: V0, x1: V1, x2: V2) => T1
  ): (x0: V0, x1: V1, x2: V2) => T3;

  <V0, T1, T2, T3, T4>(
    fn3: (x: T3) => T4,
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x: V0) => T1
  ): (x: V0) => T4;
  <V0, V1, T1, T2, T3, T4>(
    fn3: (x: T3) => T4,
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x0: V0, x1: V1) => T1
  ): (x0: V0, x1: V1) => T4;
  <V0, V1, V2, T1, T2, T3, T4>(
    fn3: (x: T3) => T4,
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x0: V0, x1: V1, x2: V2) => T1
  ): (x0: V0, x1: V1, x2: V2) => T4;

  <V0, T1, T2, T3, T4, T5>(
    fn4: (x: T4) => T5,
    fn3: (x: T3) => T4,
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x: V0) => T1
  ): (x: V0) => T5;
  <V0, V1, T1, T2, T3, T4, T5>(
    fn4: (x: T4) => T5,
    fn3: (x: T3) => T4,
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x0: V0, x1: V1) => T1
  ): (x0: V0, x1: V1) => T5;
  <V0, V1, V2, T1, T2, T3, T4, T5>(
    fn4: (x: T4) => T5,
    fn3: (x: T3) => T4,
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x0: V0, x1: V1, x2: V2) => T1
  ): (x0: V0, x1: V1, x2: V2) => T5;

  <V0, T1, T2, T3, T4, T5, T6>(
    fn5: (x: T5) => T6,
    fn4: (x: T4) => T5,
    fn3: (x: T3) => T4,
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x: V0) => T1
  ): (x: V0) => T6;
  <V0, V1, T1, T2, T3, T4, T5, T6>(
    fn5: (x: T5) => T6,
    fn4: (x: T4) => T5,
    fn3: (x: T3) => T4,
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x0: V0, x1: V1) => T1
  ): (x0: V0, x1: V1) => T6;
  <V0, V1, V2, T1, T2, T3, T4, T5, T6>(
    fn5: (x: T5) => T6,
    fn4: (x: T4) => T5,
    fn3: (x: T3) => T4,
    fn2: (x: T2) => T3,
    fn1: (x: T1) => T2,
    fn0: (x0: V0, x1: V1, x2: V2) => T1
  ): (x0: V0, x1: V1, x2: V2) => T6;
  (...fns: Array<Func>): Func;
}

export const compose = ((...fns: any[]) =>
  (...args: any[]) => {
    const n = fns.length - 1;
    let result = fns[n](...args);

    for (let i = n - 1; i >= 0; i--) {
      result = fns[i](result);
    }

    return result;
  }) as Compose;
