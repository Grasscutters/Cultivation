import { createContext, useContext } from 'solid-js';

import type { createConfigurationReactiveManager } from './index';

type ReactiveManager = Awaited<
  ReturnType<typeof createConfigurationReactiveManager>
>;

const ConfigurationContext = createContext<ReactiveManager | null>(null);

function useConfigurationManager() {
  const manager = useContext(ConfigurationContext);

  if (!manager) throw new Error('Wrap in provider!');

  return manager;
}

const ConfigurationProvider = ConfigurationContext.Provider;

export { ConfigurationProvider, useConfigurationManager };
