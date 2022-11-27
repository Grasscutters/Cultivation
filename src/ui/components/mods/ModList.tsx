import { batch, createMemo, createSignal, For, onMount, Show } from 'solid-js';

import { getConfigOption } from '../../../utils/configuration';
import {
  getInstalledMods,
  getMods,
  ModData,
  PartialModData,
} from '../../../utils/gamebanana';
import { LoadingCircle } from './LoadingCircle';
import { ModTile } from './ModTile';

import './ModList.css';

interface IProps {
  mode: string;
  addDownload: (mod: ModData) => void;
}

export function ModList(props: IProps) {
  const [horny, setHorny] = createSignal(false);
  const [modList, setModList] = createSignal<ModData[] | null>(null);
  const [installedList, setInstalledList] = createSignal<
    | {
        path: string;
        info: ModData | PartialModData;
      }[]
    | null
  >(null);

  onMount(async () => {
    if (props.mode === 'installed') {
      const installedMods = (await getInstalledMods()).map((mod) => {
        // Check if it's a partial mod, and if so, fill in some pseudo-data
        if (!('id' in mod.info)) {
          const newInfo = mod.info as PartialModData;

          newInfo.images = [];
          newInfo.submitter = { name: 'Unknown' };
          newInfo.likes = 0;
          newInfo.views = 0;

          mod.info = newInfo;

          return mod;
        }

        return mod;
      });

      setInstalledList(installedMods);

      return;
    }

    const mods = await getMods(props.mode);
    const horny = await getConfigOption('horny_mode');

    batch(() => {
      setHorny(horny);
      setModList(mods);
    });
  });

  async function downloadMod(mod: ModData) {
    props.addDownload(mod);
  }

  // Please somebody explain to me what the logic should be here?
  // Seems really over the top tbh.
  const convolutedCondition = createMemo(
    () =>
      (modList() && props.mode !== 'installed') ||
      (installedList() && props.mode === 'installed')
  );

  return (
    <div class="ModList">
      <Show
        when={convolutedCondition()}
        keyed={false}
        fallback={<LoadingCircle />}>
        <div class="ModListInner">
          <Show
            when={props.mode === 'installed'}
            keyed={false}
            fallback={
              <For each={modList()}>
                {(mod) => (
                  <ModTile
                    horny={horny()}
                    mod={mod}
                    key={mod.id}
                    onClick={downloadMod}
                  />
                )}
              </For>
            }>
            <For each={installedList()}>
              {(mod) => (
                <ModTile
                  horny={horny()}
                  path={mod.path}
                  mod={mod.info}
                  key={mod.info.name}
                  onClick={downloadMod}
                />
              )}
            </For>
          </Show>
        </div>
      </Show>
    </div>
  );
}
