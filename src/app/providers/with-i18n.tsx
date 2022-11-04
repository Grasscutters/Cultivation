import type { Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { createI18nContext, I18nContext } from 'shared/lib/i18n';

export function withI18n(component: Component) {
  return () => {
    const context = createI18nContext({}, 'en');
    return (
      <I18nContext.Provider value={context}>
        <Dynamic component={component} />
      </I18nContext.Provider>
    );
  };
}
