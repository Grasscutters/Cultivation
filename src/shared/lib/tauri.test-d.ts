import { test, expectTypeOf } from 'vitest';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

declare module './tauri' {
  export interface InvokeMap {
    __type_test_command__: {
      args: { x: 42; y: 'answer' };
      return: 'huh.';
    };
  }

  export interface EventMap {
    __type_test_event__: {
      arg1: 'hello from typetest';
      arg2: 42;
    };
  }
}

test('invoke works with primitive example', async () => {
  const res = await invoke('__type_test_command__', {
    x: 42,
    y: 'answer',
  });

  expectTypeOf(res).toEqualTypeOf<'huh.'>();
});

test('invoke with incorrect args returns never', async () => {
  const res = await invoke('__type_test_command__', 'my_arg');

  expectTypeOf(res).toBeNever();
});

test('listen works with simple example', () => {
  listen('__type_test_event__', ({ payload }) => {
    expectTypeOf(payload).toEqualTypeOf<{
      arg1: 'hello from typetest';
      arg2: 42;
    }>();
  });
});

test('listen accepts never as handler when event does not exist', () => {
  expectTypeOf(listen('i do not exist :(', 1 as any)).toBeNever();
});
