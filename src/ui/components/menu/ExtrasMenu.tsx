<<<<<<< HEAD
import { JSX, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { invoke } from '@tauri-apps/api';

import { getConfig, saveConfig } from '../../../utils/configuration';
import { getGameExecutable } from '../../../utils/game';
import Tr from '../../../utils/language';
import BigButton from '../common/BigButton';
import Checkbox from '../common/Checkbox';
import Menu from './Menu';

import './ExtrasMenu.css';

interface IProps {
  children: JSX.Element;
  closeFn: () => void;
  playGame: (exe?: string, proc_name?: string) => void;
=======
import { getConfig, saveConfig } from '../../../utils/configuration'
import Checkbox from '../common/Checkbox'
import Menu from './Menu'

import './ExtrasMenu.css'
import BigButton from '../common/BigButton'
import { invoke } from '@tauri-apps/api'
import Tr from '../../../utils/language'
import { getGameExecutable } from '../../../utils/game'
import {createSignal, JSX, onMount, Show} from "solid-js";
import {createStore} from "solid-js/store";

interface IProps {
  children: JSX.Element
  closeFn: () => void
  playGame: (exe?: string, proc_name?: string) => void
>>>>>>> aa45f04 (feat: move to solid-js)
}

interface IState {
  migoto?: string;
  akebi?: string;
  reshade?: string;
  launch_migoto: boolean;
  launch_akebi: boolean;
  launch_reshade: boolean;
}

export function ExtrasMenu(props: IProps) {
  const [state, setState] = createStore<IState>({
    launch_migoto: false,
    launch_akebi: false,
    launch_reshade: false,
  });

  onMount(async () => {
<<<<<<< HEAD
    const config = await getConfig();
=======
    const config = await getConfig()
>>>>>>> aa45f04 (feat: move to solid-js)

    setState({
      migoto: config.migoto_path,
      akebi: config.akebi_path,
      reshade: config.reshade_path,
      launch_akebi: config?.last_extras?.akebi ?? false,
      launch_migoto: config?.last_extras?.migoto ?? false,
      launch_reshade: config?.last_extras?.reshade ?? false,
<<<<<<< HEAD
    });
  });

  async function launchPreprograms() {
    const config = await getConfig();
=======
    })
  });

  async function launchPreprograms() {
    const config = await getConfig()
>>>>>>> aa45f04 (feat: move to solid-js)

    config.last_extras = {
      migoto: state.launch_migoto,
      akebi: state.launch_akebi,
      reshade: state.launch_reshade,
<<<<<<< HEAD
    };
=======
    }
>>>>>>> aa45f04 (feat: move to solid-js)

    await saveConfig(config);

    // Close menu
<<<<<<< HEAD
    props.closeFn();

    // This injects independent of the game
    if (state.launch_migoto) {
      await launchMigoto();
=======
    props.closeFn()

    // This injects independent of the game
    if (state.launch_migoto) {
      await launchMigoto()
>>>>>>> aa45f04 (feat: move to solid-js)
    }

    // This injects independent of the game
    if (state.launch_reshade) {
<<<<<<< HEAD
      await launchReshade();
=======
      await launchReshade()
>>>>>>> aa45f04 (feat: move to solid-js)
    }

    // This will launch the game
    if (state.launch_akebi) {
<<<<<<< HEAD
      await launchAkebi();
=======
      await launchAkebi()
>>>>>>> aa45f04 (feat: move to solid-js)

      // This already launches the game
      return;
    }

    // Launch the game
<<<<<<< HEAD
    await props.playGame();
  }

  async function launchAkebi() {
    const config = await getConfig();
=======
    await props.playGame()
  }

  async function launchAkebi() {
    const config = await getConfig()
>>>>>>> aa45f04 (feat: move to solid-js)

    // Get game exe from game path, so we can watch it
    const pathArr = config.game_install_path.replace(/\\/g, '/').split('/');
    const gameExec = pathArr[pathArr.length - 1];

<<<<<<< HEAD
    await props.playGame(config.akebi_path, gameExec);
  }

  async function launchMigoto() {
    const config = await getConfig();
=======
    await props.playGame(config.akebi_path, gameExec)
  }

  async function launchMigoto() {
    const config = await getConfig()
>>>>>>> aa45f04 (feat: move to solid-js)

    if (!config.migoto_path) return alert('Migoto not installed or set!');

    await invoke('run_program_relative', { path: config.migoto_path });
  }

  async function launchReshade() {
<<<<<<< HEAD
    const config = await getConfig();
=======
    const config = await getConfig()
>>>>>>> aa45f04 (feat: move to solid-js)

    if (!config.reshade_path) return alert('Reshade not installed or set!');

    await invoke('run_command', {
      program: config.reshade_path,
      args: [await getGameExecutable()],
      relative: true,
    });
  }

  function toggleMigoto() {
    setState('launch_migoto', (l) => !l);
  }

  function toggleAkebi() {
    setState('launch_akebi', (l) => !l);
  }

  function toggleReshade() {
    setState('launch_reshade', (l) => !l);
  }

  return (
    <Menu closeFn={props.closeFn} heading="Extras" class="ExtrasMenu">
      <div class="ExtrasMenuContent">
        <Show when={state.migoto} keyed={false}>
          <div class="ExtraItem">
            <div class="ExtraItemLabel">
              <Tr text="swag.migoto_name" />
            </div>
<<<<<<< HEAD
            <Checkbox
              id="MigotoCheckbox"
              checked={state.launch_migoto}
              onChange={toggleMigoto}
            />
=======
            <Checkbox id="MigotoCheckbox" checked={state.launch_migoto} onChange={toggleMigoto} />
>>>>>>> aa45f04 (feat: move to solid-js)
          </div>
        </Show>

        <Show when={state.akebi} keyed={false}>
          <div class="ExtraItem">
            <div class="ExtraItemLabel">
              <Tr text="swag.akebi_name" />
            </div>
<<<<<<< HEAD
            <Checkbox
              id="AkebiCheckbox"
              checked={state.launch_akebi}
              onChange={toggleAkebi}
            />
=======
            <Checkbox id="AkebiCheckbox" checked={state.launch_akebi} onChange={toggleAkebi} />
>>>>>>> aa45f04 (feat: move to solid-js)
          </div>
        </Show>

        <Show when={state.reshade} keyed={false}>
          <div class="ExtraItem">
            <div class="ExtraItemLabel">
              <Tr text="swag.reshade_name" />
            </div>
<<<<<<< HEAD
            <Checkbox
              id="ReshadeCheckbox"
              checked={state.launch_reshade}
              onChange={toggleReshade}
            />
=======
            <Checkbox id="ReshadeCheckbox" checked={state.launch_reshade} onChange={toggleReshade} />
>>>>>>> aa45f04 (feat: move to solid-js)
          </div>
        </Show>
      </div>
      <div class="ExtraLaunch">
        <BigButton id="ExtraLaunch" onClick={launchPreprograms}>
          <Tr text="main.launch_button" />
        </BigButton>
      </div>
    </Menu>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
