import { useConfigurationManager } from 'entities/configuration';
import type { DownloadProps } from 'features/download/model';
import {
  downloadGrasscutterFiles,
  generateDownloadUiData,
  generatePath,
  useDownloadManager,
} from 'features/download/model';
import { useEnrichedI18n } from 'shared/lib/i18n';
import { BigButton } from 'shared/ui/atoms/big-button';
import { HelpButton } from 'shared/ui/atoms/help-button';
import type { JSXElement } from 'solid-js';
import {
  createComputed,
  createMemo,
  createSignal,
  getOwner,
  runWithOwner,
  Show,
} from 'solid-js';
import { capitalize } from 'utils/string';

type DownloadUiSharedProps = {
  class?: string;
  disabled?: boolean;
};

type DownloadUiProps = DownloadProps & DownloadUiSharedProps;

export function Download(props: DownloadUiProps): JSXElement {
  const [gcSet, setGcSet] = createSignal(false);
  const { getConfigOption } = useConfigurationManager();
  const downloadManager = useDownloadManager();
  let abortController = new AbortController();

  createComputed(() => {
    const gcPath = getConfigOption('grasscutter_path');
    setGcSet(downloadManager.jarExtracted() || gcPath !== '');
  });

  const [t] = useEnrichedI18n();

  const downloading = createMemo(() =>
    downloadManager[`downloading${capitalize(props.download)}`]()
  );

  const uiData = createMemo(() => generateDownloadUiData(props));

  const owner = getOwner();

  function abort() {
    abortController.abort();
    abortController = new AbortController();
  }

  function onClick() {
    if (owner)
      runWithOwner(owner, () =>
        downloadGrasscutterFiles(props, abortController.signal)
      );
  }

  return (
    <div
      class="downloadMenuSection"
      id={`downloadMenuContainer${uiData().idSuffix}`}>
      <div class="DownloadLabel" id={`downloadMenuLabel${uiData().idSuffix}`}>
        <Show when={gcSet()} keyed={false} fallback={t(uiData().gcUnset)}>
          {t(uiData().gcSet)}
          <HelpButton contents={uiData().help} />
        </Show>
      </div>
      <div class="downloadValue" id={`downloadMenuButton${uiData().idSuffix}`}>
        <BigButton
          disabled={downloading() || props.disabled}
          onClick={onClick}
          id={uiData().btn}>
          {t('components.download')}
        </BigButton>
        <button onClick={abort}>Cancel {generatePath(props.download)}</button>
      </div>
    </div>
  );
}
