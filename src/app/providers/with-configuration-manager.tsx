import {
  ConfigurationProvider,
  createConfigurationReactiveManager,
} from 'entities/configuration';
import type { Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function withConfigurationManager(component: Component) {
  return function ConfigurationManager() {
    return (
      <ConfigurationProvider value={createConfigurationReactiveManager()}>
        <Dynamic component={component} />
      </ConfigurationProvider>
    );
  };
}
