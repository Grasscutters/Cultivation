import { For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { invoke } from '@tauri-apps/api';
import { dataDir } from '@tauri-apps/api/path';

import {
  Configuration,
  getConfig,
  getConfigOption,
  setConfigOption,
} from '../../../utils/configuration';
import DownloadHandler from '../../../utils/download';
import Tr, { getLanguages, translate } from '../../../utils/language';
import * as meta from '../../../utils/metadata';
import * as server from '../../../utils/server';
import { getThemeList } from '../../../utils/themes';
import BigButton from '../common/BigButton';
import Checkbox from '../common/Checkbox';
import DirInput from '../common/DirInput';
import HelpButton from '../common/HelpButton';
import TextInput from '../common/TextInput';
import Divider from './Divider';
import Menu from './Menu';

import './Options.css';

interface IProps {
  closeFn: () => void;
  downloadManager: DownloadHandler;
}

interface IState {
  game_install_path: string;
  grasscutter_path: string;
  java_path: string;
  grasscutter_with_game: boolean;
  language_options: { [key: string]: string }[];
  current_language: string;
  bg_url_or_path: string;
  themes: string[];
  theme: string;
  encryption: boolean;
  patch_metadata: boolean;
  use_internal_proxy: boolean;
  wipe_login: boolean;
  horny_mode: boolean;
  swag: boolean;
  platform: string;

  // Swag stuff
  akebi_path: string;
  migoto_path: string;
  reshade_path: string;
}

export default function Options(props: IProps) {
  const [state, setState] = createStore<IState>({
    game_install_path: '',
    grasscutter_path: '',
    java_path: '',
    grasscutter_with_game: false,
    language_options: [],
    current_language: 'en',
    bg_url_or_path: '',
    themes: ['default'],
    theme: '',
    encryption: false,
    patch_metadata: false,
    use_internal_proxy: false,
    wipe_login: false,
    horny_mode: false,
    swag: false,
    platform: '',

    // Swag stuff
    akebi_path: '',
    migoto_path: '',
    reshade_path: '',
  });

  onMount(async () => {
    const config = await getConfig();
    const languages = await getLanguages();
    const platform: string = await invoke('get_platform');

    // Remove jar from path
    const path = config.grasscutter_path.replace(/\\/g, '/');
    const folderPath = path.substring(0, path.lastIndexOf('/'));
    const encEnabled = await server.encryptionEnabled(
      folderPath + '/config.json'
    );

    console.log(platform);

    setState({
      game_install_path: config.game_install_path || '',
      grasscutter_path: config.grasscutter_path || '',
      java_path: config.java_path || '',
      grasscutter_with_game: config.grasscutter_with_game || false,
      language_options: languages,
      current_language: config.language || 'en',
      bg_url_or_path: config.customBackground || '',
      themes: (await getThemeList()).map((t) => t.name),
      theme: config.theme || 'default',
      encryption: await translate(
        encEnabled ? 'options.enabled' : 'options.disabled'
      ),
      patch_metadata: config.patch_metadata || false,
      use_internal_proxy: config.use_internal_proxy || false,
      wipe_login: config.wipe_login || false,
      horny_mode: config.horny_mode || false,
      swag: config.swag_mode || false,
      platform,

      // Swag stuff
      akebi_path: config.akebi_path || '',
      migoto_path: config.migoto_path || '',
      reshade_path: config.reshade_path || '',
    });
  });

  function setGameExecutable(value: string) {
    setConfigOption('game_install_path', value);

    // I hope this stops people setting launcher.exe because oml it's annoying
    if (value.endsWith('launcher.exe')) {
      const pathArr = value.replace(/\\/g, '/').split('/');
      pathArr.pop();
      const path = pathArr.join('/') + '/Genshin Impact Game/';

      alert(
        `You have set your game execuatable to "launcher.exe". You should not do this. Your game executable is located in:\n\n${path}`
      );
    }

    setState({
      game_install_path: value,
    });
  }

  function setGrasscutterJar(value: string) {
    setConfigOption('grasscutter_path', value);

    setState({
      grasscutter_path: value,
    });
  }

  function setJavaPath(value: string) {
    setConfigOption('java_path', value);

    setState({
      java_path: value,
    });
  }

  function setAkebi(value: string) {
    setConfigOption('akebi_path', value);

    setState({
      akebi_path: value,
    });
  }

  function setMigoto(value: string) {
    setConfigOption('migoto_path', value);

    setState({
      migoto_path: value,
    });

    // Set game exe in Migoto ini
    invoke('set_migoto_target', {
      path: state.game_install_path,
      migotoPath: value,
    });
  }

  function setReshade(value: string) {
    setConfigOption('reshade_path', value);

    setState({
      reshade_path: value,
    });
  }

  async function setLanguage(value: string) {
    await setConfigOption('language', value);
    window.location.reload();
  }

  async function setTheme(value: string) {
    await setConfigOption('theme', value);
    window.location.reload();
  }

  async function setCustomBackground(value: string) {
    const isUrl = /^(?:http(s)?:\/\/)/gm.test(value);

    if (!value) return await setConfigOption('customBackground', '');

    if (!isUrl) {
      const filename = value.replace(/\\/g, '/').split('/').pop();
      const localBgPath = ((await dataDir()) as string).replace(/\\/g, '/');

      await setConfigOption(
        'customBackground',
        `${localBgPath}/cultivation/bg/${filename}`
      );

      // Copy the file over to the local directory
      await invoke('copy_file', {
        path: value.replace(/\\/g, '/'),
        newPath: `${localBgPath}cultivation/bg/`,
      });

      window.location.reload();
    } else {
      await setConfigOption('customBackground', value);
      window.location.reload();
    }
  }

  async function toggleEncryption() {
    const config = await getConfig();

    // Check if grasscutter path is set
    if (!config.grasscutter_path) {
      alert('Grasscutter not set!');
      return;
    }

    // Remove jar from path
    const path = config.grasscutter_path.replace(/\\/g, '/');
    const folderPath = path.substring(0, path.lastIndexOf('/'));

    await server.toggleEncryption(folderPath + '/config.json');

    setState({
      encryption: await translate(
        (await server.encryptionEnabled(folderPath + '/config.json'))
          ? 'options.enabled'
          : 'options.disabled'
      ),
    });
  }

  async function restoreMetadata() {
    await meta.restoreMetadata(props.downloadManager);
  }

  async function installCert() {
    await invoke('generate_ca_files', {
      path: (await dataDir()) + 'cultivation',
    });
  }

  async function toggleOption(opt: keyof Configuration) {
    const changedVal = !(await getConfigOption(opt));

    await setConfigOption(opt, changedVal);

    setState({
      [opt]: changedVal,
    });
  }

  return (
    <Menu closeFn={props.closeFn} class="Options" heading="Options">
      <Show
        when={!state.platform || state.platform === 'windows'}
        keyed={false}
        fallback={
          <div class="OptionSection" id="menuOptionsContainerGameCommand">
            <div class="OptionLabel" id="menuOptionsLabelGameCommand">
              <Tr text="options.game_command" />
            </div>
            <div class="OptionValue" id="menuOptionsGameCommand">
              <TextInput />
            </div>
          </div>
        }>
        <div class="OptionSection" id="menuOptionsContainerGamePath">
          <div class="OptionLabel" id="menuOptionsLabelGamePath">
            <Tr text="options.game_path" />
          </div>
          <div class="OptionValue" id="menuOptionsDirGamePath">
            <DirInput
              onChange={setGameExecutable}
              value={state?.game_install_path}
              extensions={['exe']}
            />
          </div>
        </div>
      </Show>
      <div class="OptionSection" id="menuOptionsContainermetaDownload">
        <div class="OptionLabel" id="menuOptionsLabelmetaDownload">
          <Tr text="options.recover_metadata" />
          <HelpButton contents="help.emergency_metadata" />
        </div>
        <div class="OptionValue" id="menuOptionsButtonmetaDownload">
          <BigButton onClick={restoreMetadata} id="metaDownload">
            <Tr text="components.download" />
          </BigButton>
        </div>
      </div>
      <div class="OptionSection" id="menuOptionsContainerPatchMeta">
        <div class="OptionLabel" id="menuOptionsLabelPatchMeta">
          <Tr text="options.patch_metadata" />
          <HelpButton contents="help.patch_metadata" />
        </div>
        <div class="OptionValue" id="menuOptionsCheckboxPatchMeta">
          <Checkbox
            onChange={() => toggleOption('patch_metadata')}
            checked={state?.patch_metadata}
            id="patchMeta"
          />
        </div>
      </div>
      <div class="OptionSection" id="menuOptionsContainerUseProxy">
        <div class="OptionLabel" id="menuOptionsLabelUseProxy">
          <Tr text="options.use_proxy" />
          <HelpButton contents="help.use_proxy" />
        </div>
        <div class="OptionValue" id="menuOptionsCheckboxUseProxy">
          <Checkbox
            onChange={() => toggleOption('use_internal_proxy')}
            checked={state?.use_internal_proxy}
            id="useProxy"
          />
        </div>
      </div>
      <div class="OptionSection" id="menuOptionsContainerWipeLogin">
        <div class="OptionLabel" id="menuOptionsLabelWipeLogin">
          <Tr text="options.wipe_login" />
        </div>
        <div class="OptionValue" id="menuOptionsCheckboxWipeLogin">
          <Checkbox
            onChange={() => toggleOption('wipe_login')}
            checked={state?.wipe_login}
            id="wipeLogin"
          />
        </div>
      </div>

      <Divider />

      <div class="OptionSection" id="menuOptionsContainerGCJar">
        <div class="OptionLabel" id="menuOptionsLabelGCJar">
          <Tr text="options.grasscutter_jar" />
        </div>
        <div class="OptionValue" id="menuOptionsDirGCJar">
          <DirInput
            onChange={setGrasscutterJar}
            value={state?.grasscutter_path}
            extensions={['jar']}
          />
        </div>
      </div>
      <div class="OptionSection" id="menuOptionsContainerToggleEnc">
        <div class="OptionLabel" id="menuOptionsLabelToggleEnc">
          <Tr text="options.toggle_encryption" />
          <HelpButton contents="help.encryption" />
        </div>
        <div class="OptionValue" id="menuOptionsButtonToggleEnc">
          <BigButton onClick={toggleEncryption} id="toggleEnc">
            {state.encryption}
          </BigButton>
        </div>
      </div>
      <div class="OptionSection" id="menuOptionsContainerInstallCert">
        <div class="OptionLabel" id="menuOptionsLabelInstallCert">
          <Tr text="options.install_certificate" />
        </div>
        <div class="OptionValue" id="menuOptionsButtonInstallCert">
          <BigButton disabled={false} onClick={installCert} id="installCert">
            <Tr text="components.install" />
          </BigButton>
        </div>
      </div>

      <Show when={state.swag} keyed={false}>
        <>
          <Divider />
          <div class="OptionSection" id="menuOptionsContainerAkebi">
            <div class="OptionLabel" id="menuOptionsLabelAkebi">
              <Tr text="swag.akebi" />
            </div>
            <div class="OptionValue" id="menuOptionsDirAkebi">
              <DirInput
                onChange={setAkebi}
                value={state?.akebi_path}
                extensions={['exe']}
              />
            </div>
          </div>
          <div class="OptionSection" id="menuOptionsContainerMigoto">
            <div class="OptionLabel" id="menuOptionsLabelMigoto">
              <Tr text="swag.migoto" />
            </div>
            <div class="OptionValue" id="menuOptionsDirMigoto">
              <DirInput
                onChange={setMigoto}
                value={state?.migoto_path}
                extensions={['exe']}
              />
            </div>
          </div>
          <div class="OptionSection" id="menuOptionsContainerReshade">
            <div class="OptionLabel" id="menuOptionsLabelReshade">
              <Tr text="swag.reshade" />
            </div>
            <div class="OptionValue" id="menuOptionsDirReshade">
              <DirInput
                onChange={setReshade}
                value={state?.reshade_path}
                extensions={['exe']}
              />
            </div>
          </div>
        </>
      </Show>

      <Divider />

      <div class="OptionSection" id="menuOptionsContainerGCWGame">
        <div class="OptionLabel" id="menuOptionsLabelGCWDame">
          <Tr text="options.grasscutter_with_game" />
        </div>
        <div class="OptionValue" id="menuOptionsCheckboxGCWGame">
          <Checkbox
            onChange={() => toggleOption('grasscutter_with_game')}
            checked={state?.grasscutter_with_game}
            id="gcWithGame"
          />
        </div>
      </div>

      <Show when={state.swag} keyed={false}>
        <div class="OptionSection" id="menuOptionsContainerHorny">
          <div class="OptionLabel" id="menuOptionsLabelHorny">
            <Tr text="options.horny_mode" />
          </div>
          <div class="OptionValue" id="menuOptionsCheckboxHorny">
            <Checkbox
              onChange={() => toggleOption('horny_mode')}
              checked={state?.horny_mode}
              id="hornyMode"
            />
          </div>
        </div>
      </Show>

      <Divider />

      <div class="OptionSection" id="menuOptionsContainerThemes">
        <div class="OptionLabel" id="menuOptionsLabelThemes">
          <Tr text="options.theme" />
        </div>
        <div class="OptionValue" id="menuOptionsSelectThemes">
          <select
            value={state.theme}
            id="menuOptionsSelectMenuThemes"
            onChange={(event) => {
              setTheme(event.currentTarget.value);
            }}>
            <For each={state.themes}>
              {(t) => <option value={t}>{t}</option>}
            </For>
          </select>
        </div>
      </div>

      <Divider />

      <div class="OptionSection" id="menuOptionsContainerJavaPath">
        <div class="OptionLabel" id="menuOptionsLabelJavaPath">
          <Tr text="options.java_path" />
        </div>
        <div class="OptionValue" id="menuOptionsDirJavaPath">
          <DirInput
            onChange={setJavaPath}
            value={state?.java_path}
            extensions={['exe']}
          />
        </div>
      </div>

      <div class="OptionSection" id="menuOptionsContainerBG">
        <div class="OptionLabel" id="menuOptionsLabelBG">
          <Tr text="options.background" />
        </div>
        <div class="OptionValue" id="menuOptionsDirBG">
          <DirInput
            onChange={setCustomBackground}
            value={state?.bg_url_or_path}
            extensions={['png', 'jpg', 'jpeg']}
            readonly={false}
            clearable={true}
            customClearBehaviour={() => {
              setConfigOption('customBackground', '').then(
                window.location.reload
              );
            }}
          />
        </div>
      </div>

      <div class="OptionSection" id="menuOptionsContainerLang">
        <div class="OptionLabel" id="menuOptionsLabelLang">
          <Tr text="options.language" />
        </div>
        <div class="OptionValue" id="menuOptionsSelectLang">
          <select
            value={state.current_language}
            id="menuOptionsSelectMenuLang"
            onChange={(event) => {
              setLanguage(event.currentTarget.value);
            }}>
            <For each={state.language_options}>
              {(lang) => (
                <option value={Object.keys(lang)[0]}>
                  {lang[Object.keys(lang)[0]]}
                </option>
              )}
            </For>
          </select>
        </div>
      </div>
    </Menu>
  );
}
