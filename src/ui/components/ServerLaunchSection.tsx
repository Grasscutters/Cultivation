import { onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { dataDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/tauri';

import Plus from '../../resources/icons/plus.svg';
import Server from '../../resources/icons/server.svg';
import {
  getConfig,
  saveConfig,
  setConfigOption,
} from '../../utils/configuration';
import { getGameExecutable, getGameVersion } from '../../utils/game';
import { translate } from '../../utils/language';
import { patchGame, unpatchGame } from '../../utils/metadata';
import BigButton from './common/BigButton';
import Checkbox from './common/Checkbox';
import HelpButton from './common/HelpButton';
import TextInput from './common/TextInput';

import './ServerLaunchSection.css';

interface IProps {
  openExtras: (playGame: () => void) => void;
}

interface IState {
  grasscutterEnabled: boolean;
  buttonLabel: string;
  checkboxLabel: string;
  ip: string;
  port: string;

  ipPlaceholder: string;
  portPlaceholder: string;

  portHelpText: string;

  httpsLabel: string;
  httpsEnabled: boolean;

  swag: boolean;
  akebiSet: boolean;
  migotoSet: boolean;
}

export default function ServerLaunchSection(props: IProps) {
  const [state, setState] = createStore<IState>({
    grasscutterEnabled: false,
    buttonLabel: '',
    checkboxLabel: '',
    ip: '',
    port: '',
    ipPlaceholder: '',
    portPlaceholder: '',
    portHelpText: '',
    httpsLabel: '',
    httpsEnabled: false,
    swag: false,
    akebiSet: false,
    migotoSet: false,
  });

  onMount(async () => {
    const config = await getConfig();

    setState({
      grasscutterEnabled: config.toggle_grasscutter || false,
      buttonLabel: await translate('main.launch_button'),
      checkboxLabel: await translate('main.gc_enable'),
      ip: config.last_ip || '',
      port: config.last_port || '',
      ipPlaceholder: await translate('main.ip_placeholder'),
      portPlaceholder: await translate('help.port_placeholder'),
      portHelpText: await translate('help.port_help_text'),
      httpsLabel: await translate('main.https_enable'),
      httpsEnabled: config.https_enabled || false,
      swag: config.swag_mode || false,
      akebiSet: config.akebi_path !== '',
      migotoSet: config.migoto_path !== '',
    });
  });

  async function toggleGrasscutter() {
    const config = await getConfig();

    config.toggle_grasscutter = !config.toggle_grasscutter;

    // Set state as well
    setState('grasscutterEnabled', config.toggle_grasscutter);

    await saveConfig(config);
  }

  async function playGame(exe?: string, proc_name?: string) {
    const config = await getConfig();

    if (!(await getGameExecutable())) {
      alert('Game executable not set!');
      return;
    }

    // Connect to proxy
    if (config.toggle_grasscutter) {
      if (config.patch_metadata) {
        const gameVersion = await getGameVersion();
        console.log(gameVersion);

        if (gameVersion == null) {
          alert(
            'Game version could not be determined. Please make sure you have the game correctly selected and try again.'
          );
          return;
        }

        if (gameVersion?.major === 2 && gameVersion?.minor < 8) {
          alert(
            'Game version is too old for metadata patching. Please disable metadata patching in the settings and try again.'
          );
          return;
        }

        if (gameVersion?.major === 3 && gameVersion?.minor >= 1) {
          alert(
            'Game version is too new for metadata patching. ' +
              'Please disable metadata patching in the settings' +
              ' to launch the game.\nNOTE: ' +
              'You will require a UA patch to play the game.'
          );
          return;
        }

        const patched = await patchGame();

        if (!patched) {
          alert('Could not patch game!');
          return;
        }
      }

      const game_exe = await getGameExecutable();

      // Save last connected server and port
      // TODO[perf]: could be batched
      await setConfigOption('last_ip', state.ip);
      await setConfigOption('last_port', state.port);

      await invoke('enable_process_watcher', {
        process: proc_name || game_exe,
      });

      if (config.use_internal_proxy) {
        // Set IP
        await invoke('set_proxy_addr', {
          addr:
            (state.httpsEnabled ? 'https' : 'http') +
            '://' +
            state.ip +
            ':' +
            state.port,
        });
        // Connect to proxy
        await invoke('connect', {
          port: 8365,
          certificatePath: (await dataDir()) + '\\cultivation\\ca',
        });
      }

      // Open server as well if the options are set
      if (config.grasscutter_with_game) {
        const jarFolderArr = config.grasscutter_path
          .replace(/\\/g, '/')
          .split('/');
        jarFolderArr.pop();

        const jarFolder = jarFolderArr.join('/');

        await invoke('run_jar', {
          path: config.grasscutter_path,
          executeIn: jarFolder,
          javaPath: config.java_path || '',
        });
      }
    } else {
      const unpatched = await unpatchGame();

      if (!unpatched) {
        alert(
          `Could not unpatch game, aborting launch! (You can find your metadata backup in ${await dataDir()}\\cultivation\\)`
        );
        return;
      }
    }

    if (config.wipe_login) {
      // First wipe registry if we have to
      await invoke('wipe_registry', {
        // The exe is always PascalCase so we can get the dir using regex
        execName: (await getGameExecutable())
          ?.split('.exe')[0]
          .replace(/([a-z\d])([A-Z])/g, '$1 $2'),
      });
    }

    // Launch the program
    const gameExists = await invoke('dir_exists', {
      path: exe || config.game_install_path,
    });

    if (gameExists)
      await invoke('run_program_relative', {
        path: exe || config.game_install_path,
      });
    else alert('Game not found! At: ' + (exe || config.game_install_path));
  }

  async function launchServer() {
    const config = await getConfig();

    if (!config.grasscutter_path)
      return alert('Grasscutter not installed or set!');

    let jarFolder = config.grasscutter_path;

    if (jarFolder.includes('/')) {
      jarFolder = jarFolder.substring(
        0,
        config.grasscutter_path.lastIndexOf('/')
      );
    } else {
      jarFolder = jarFolder.substring(
        0,
        config.grasscutter_path.lastIndexOf('\\')
      );
    }

    // Launch the jar
    await invoke('run_jar', {
      path: config.grasscutter_path,
      executeIn: jarFolder,
      javaPath: config.java_path || '',
    });
  }

  function setIp(text: string) {
    setState('ip', text);
  }

  function setPort(text: string) {
    setState('port', text);
  }

  async function toggleHttps() {
    const config = await getConfig();

    config.https_enabled = !config.https_enabled;

    // Set state as well
    setState('httpsEnabled', config.https_enabled);

    await saveConfig(config);
  }

  return (
    <div id="playButton">
      <div id="serverControls">
        <Checkbox
          id="enableGC"
          label={state.checkboxLabel}
          onChange={toggleGrasscutter}
          checked={state.grasscutterEnabled}
        />
      </div>

      <Show when={state.grasscutterEnabled} keyed={false}>
        <div>
          <div class="ServerConfig" id="serverConfigContainer">
            <TextInput
              id="ip"
              placeholder={state.ipPlaceholder}
              onChange={setIp}
              initalValue={state.ip}
            />
            <TextInput
              style={{
                width: '10%',
              }}
              id="port"
              placeholder={state.portPlaceholder}
              onChange={setPort}
              initalValue={state.port}
            />
            <HelpButton contents={state.portHelpText} />
            <Checkbox
              id="httpsEnable"
              label={state.httpsLabel}
              onChange={toggleHttps}
              checked={state.httpsEnabled}
            />
          </div>
        </div>
      </Show>

      <div class="ServerLaunchButtons" id="serverLaunchContainer">
        <BigButton onClick={playGame} id="officialPlay">
          {state.buttonLabel}
        </BigButton>
        <Show when={state.swag} keyed={false}>
          <BigButton
            onClick={() => props.openExtras(playGame)}
            id="ExtrasMenuButton">
            <img class="ExtrasIcon" id="extrasIcon" src={Plus} />
          </BigButton>
        </Show>
        <BigButton onClick={launchServer} id="serverLaunch">
          <img class="ServerIcon" id="serverLaunchIcon" src={Server} />
        </BigButton>
      </div>
    </div>
  );
}
