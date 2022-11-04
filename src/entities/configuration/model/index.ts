import { createStore } from 'solid-js/store';

import { createConfigurationManager, defaultConfig } from '../lib';
import type { Configuration } from '../lib/types';

export function createConfigurationReactiveManager() {
  const configurationManagerPromise = createConfigurationManager();

  const [configStore, setConfigStore] = createStore(defaultConfig);

  configurationManagerPromise.then(({ config }) => setConfigStore(config));

  function getConfigOption<K extends keyof Configuration>(key: K) {
    return configStore[key];
  }

  function setConfigOption<K extends keyof Configuration>(
    key: K,
    value: Configuration[K]
  ) {
    setConfigStore(key, value);
    configurationManagerPromise.then(({ saveConfig }) =>
      saveConfig(configStore)
    );
  }

  return {
    getConfigOption,
    setConfigOption,
  };
}

export * from './provider';
