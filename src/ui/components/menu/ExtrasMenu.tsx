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
}

interface IState {
  migoto?: string
  akebi?: string
  reshade?: string
  launch_migoto: boolean
  launch_akebi: boolean
  launch_reshade: boolean
}

export function ExtrasMenu(props: IProps) {
  const [state, setState] = createStore<IState>({
    launch_migoto: false,
    launch_akebi: false,
    launch_reshade: false,
  });

  onMount(async () => {
    const config = await getConfig()

    setState({
      migoto: config.migoto_path,
      akebi: config.akebi_path,
      reshade: config.reshade_path,
      launch_akebi: config?.last_extras?.akebi ?? false,
      launch_migoto: config?.last_extras?.migoto ?? false,
      launch_reshade: config?.last_extras?.reshade ?? false,
    })
  });

  async function launchPreprograms() {
    const config = await getConfig()

    config.last_extras = {
      migoto: state.launch_migoto,
      akebi: state.launch_akebi,
      reshade: state.launch_reshade,
    }

    await saveConfig(config)

    // Close menu
    props.closeFn()

    // This injects independent of the game
    if (state.launch_migoto) {
      await launchMigoto()
    }

    // This injects independent of the game
    if (state.launch_reshade) {
      await launchReshade()
    }

    // This will launch the game
    if (state.launch_akebi) {
      await launchAkebi()

      // This already launches the game
      return
    }

    // Launch the game
    await props.playGame()
  }

  async function launchAkebi() {
    const config = await getConfig()

    // Get game exe from game path, so we can watch it
    const pathArr = config.game_install_path.replace(/\\/g, '/').split('/')
    const gameExec = pathArr[pathArr.length - 1]

    await props.playGame(config.akebi_path, gameExec)
  }

  async function launchMigoto() {
    const config = await getConfig()

    if (!config.migoto_path) return alert('Migoto not installed or set!')

    await invoke('run_program_relative', { path: config.migoto_path })
  }

  async function launchReshade() {
    const config = await getConfig()

    if (!config.reshade_path) return alert('Reshade not installed or set!')

    await invoke('run_command', {
      program: config.reshade_path,
      args: [await getGameExecutable()],
      relative: true,
    })
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
            <Checkbox id="MigotoCheckbox" checked={state.launch_migoto} onChange={toggleMigoto} />
          </div>
        </Show>

        <Show when={state.akebi} keyed={false}>
          <div class="ExtraItem">
            <div class="ExtraItemLabel">
              <Tr text="swag.akebi_name" />
            </div>
            <Checkbox id="AkebiCheckbox" checked={state.launch_akebi} onChange={toggleAkebi} />
          </div>
        </Show>

        <Show when={state.reshade} keyed={false}>
          <div class="ExtraItem">
            <div class="ExtraItemLabel">
              <Tr text="swag.reshade_name" />
            </div>
            <Checkbox id="ReshadeCheckbox" checked={state.launch_reshade} onChange={toggleReshade} />
          </div>
        </Show>
      </div>
      <div class="ExtraLaunch">
        <BigButton id="ExtraLaunch" onClick={launchPreprograms}>
          <Tr text="main.launch_button" />
        </BigButton>
      </div>
    </Menu>
  )
}
