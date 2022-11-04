import { compose } from 'shared/lib/fp';

import { withConfigurationManager } from './with-configuration-manager';
import { withDownloadManager } from './with-downloads-manager';
import { withI18n } from './with-i18n';

export const withProviders = compose(
  withI18n,
  withConfigurationManager,
  withDownloadManager
);
