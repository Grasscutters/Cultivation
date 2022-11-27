import Menu from './Menu'
import Tr from '../../../utils/language'
import DownloadHandler from '../../../utils/download'
import { unzip } from '../../../utils/zipUtils'
import BigButton from '../common/BigButton'
import { dataDir } from '@tauri-apps/api/path'

import './Downloads.css'
import Divider from './Divider'
import { getConfigOption } from '../../../utils/configuration'
import { invoke } from '@tauri-apps/api'
import { listen } from '@tauri-apps/api/event'
import HelpButton from '../common/HelpButton'
import {createStore} from "solid-js/store";
import {onCleanup, onMount} from "solid-js";

const STABLE_REPO_DOWNLOAD = 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/stable.zip'
const DEV_REPO_DOWNLOAD = 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/development.zip'
const STABLE_DOWNLOAD = 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/stable/Grasscutter.zip'
const DEV_DOWNLOAD = 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/development/Grasscutter.zip'
const RESOURCES_DOWNLOAD = 'https://github.com/tamilpp25/Grasscutter_Resources/archive/refs/heads/3.0.zip'

interface IProps {
  closeFn: () => void
  downloadManager: DownloadHandler
}

interface IState {
  grasscutter_downloading: boolean
  resources_downloading: boolean
  repo_downloading: boolean
  grasscutter_set: boolean
  resources_exist: boolean
}

export default function Downloads(props: IProps) {
  const [state, setState] = createStore<IState>({
    grasscutter_downloading: props.downloadManager.downloadingJar(),
    resources_downloading: props.downloadManager.downloadingResources(),
    repo_downloading: props.downloadManager.downloadingRepo(),
    grasscutter_set: false,
    resources_exist: false,
  });

  const unlisten = listen('jar_extracted', () => {
    setState('grasscutter_set', true);
  });

  onCleanup(() => unlisten.then((ul) => ul()));

  onMount(async () => {
    const gc_path = await getConfigOption('grasscutter_path')

    if (!gc_path || gc_path === '') {
      setState({
        grasscutter_set: false,
        resources_exist: false,
      })

      return
    }

    const path = gc_path.substring(0, gc_path.lastIndexOf('\\'))

    if (gc_path) {
      const resources_exist: boolean =
        ((await invoke('dir_exists', {
          path: path + '\\resources',
        })) as boolean) &&
        (!(await invoke('dir_is_empty', {
          path: path + '\\resources',
        })) as boolean)

      setState({
        grasscutter_set: gc_path !== '',
        resources_exist,
      })
    }
  });

  async function getGrasscutterFolder() {
    const path = await getConfigOption('grasscutter_path')
    let folderPath

    // Set to default if not set
    if (!path || path === '') {
      const appdata = await dataDir()
      folderPath = appdata + 'cultivation\\grasscutter'

      // Early return since its formatted properly
      return folderPath
    }

    if (path.includes('/')) {
      folderPath = path.substring(0, path.lastIndexOf('/'))
    } else {
      folderPath = path.substring(0, path.lastIndexOf('\\'))
    }

    return folderPath
  }

  async function downloadGrasscutterStableRepo() {
    const folder = await getGrasscutterFolder()
    props.downloadManager.addDownload(STABLE_REPO_DOWNLOAD, folder + '\\grasscutter_repo.zip', async () => {
      await unzip(folder + '\\grasscutter_repo.zip', folder + '\\', true)
      toggleButtons()
    })

    toggleButtons()
  }

  async function downloadGrasscutterDevRepo() {
    const folder = await getGrasscutterFolder()
    props.downloadManager.addDownload(DEV_REPO_DOWNLOAD, folder + '\\grasscutter_repo.zip', async () => {
      await unzip(folder + '\\grasscutter_repo.zip', folder + '\\', true)
      toggleButtons()
    })

    toggleButtons()
  }

  async function downloadGrasscutterStable() {
    const folder = await getGrasscutterFolder()
    props.downloadManager.addDownload(STABLE_DOWNLOAD, folder + '\\grasscutter.zip', async () => {
      await unzip(folder + '\\grasscutter.zip', folder + '\\', true)
      toggleButtons
    })

    // Also add repo download
    downloadGrasscutterStableRepo()

    toggleButtons()
  }

  async function downloadGrasscutterLatest() {
    const folder = await getGrasscutterFolder()
    props.downloadManager.addDownload(DEV_DOWNLOAD, folder + '\\grasscutter.zip', async () => {
      await unzip(folder + '\\grasscutter.zip', folder + '\\', true)
      toggleButtons()
    })

    // Also add repo download
    downloadGrasscutterDevRepo()

    toggleButtons()
  }

  async function downloadResources() {
    const folder = await getGrasscutterFolder()
    props.downloadManager.addDownload(RESOURCES_DOWNLOAD, folder + '\\resources.zip', async () => {
      // Delete the existing folder if it exists
      if (
        await invoke('dir_exists', {
          path: folder + '\\resources',
        })
      ) {
        await invoke('dir_delete', {
          path: folder + '\\resources',
        })
      }

      await unzip(folder + '\\resources.zip', folder + '\\', true)
      // Rename folder to resources
      invoke('rename', {
        path: folder + '\\Resources',
        newName: 'resources',
      })

      toggleButtons()
    })

    toggleButtons()
  }

  async function toggleButtons() {
    const gc_path = await getConfigOption('grasscutter_path')

    // Set states since we know we are downloading something if this is called
    setState({
      grasscutter_downloading: props.downloadManager.downloadingJar(),
      resources_downloading: props.downloadManager.downloadingResources(),
      repo_downloading: props.downloadManager.downloadingRepo(),
      grasscutter_set: gc_path !== '',
    })
  }

  return (
    <Menu closeFn={props.closeFn} class="Downloads" heading="Downloads">
      <div class="DownloadMenuSection" id="downloadMenuContainerGCStable">
        <div class="DownloadLabel" id="downloadMenuLabelGCStable">
          <Tr
            text={state.grasscutter_set ? 'downloads.grasscutter_stable' : 'downloads.grasscutter_stable_update'}
          />
          <HelpButton contents="help.gc_stable_jar" />
        </div>
        <div class="DownloadValue" id="downloadMenuButtonGCStable">
          <BigButton
            disabled={state.grasscutter_downloading}
            onClick={downloadGrasscutterStable}
            id="grasscutterStableBtn"
          >
            <Tr text="components.download" />
          </BigButton>
        </div>
      </div>
      <div class="DownloadMenuSection" id="downloadMenuContainerGCDev">
        <div class="DownloadLabel" id="downloadMenuLabelGCDev">
          <Tr
            text={state.grasscutter_set ? 'downloads.grasscutter_latest' : 'downloads.grasscutter_latest_update'}
          />
          <HelpButton contents="help.gc_dev_jar" />
        </div>
        <div class="DownloadValue" id="downloadMenuButtonGCDev">
          <BigButton
            disabled={state.grasscutter_downloading}
            onClick={downloadGrasscutterLatest}
            id="grasscutterLatestBtn"
          >
            <Tr text="components.download" />
          </BigButton>
        </div>
      </div>

      <Divider />

      <div class="DownloadMenuSection" id="downloadMenuContainerGCStableData">
        <div class="DownloadLabel" id="downloadMenuLabelGCStableData">
          <Tr
            text={
              state.grasscutter_set
                ? 'downloads.grasscutter_stable_data'
                : 'downloads.grasscutter_stable_data_update'
            }
          />
          <HelpButton contents="help.gc_stable_data" />
        </div>
        <div class="DownloadValue" id="downloadMenuButtonGCStableData">
          <BigButton
            disabled={state.repo_downloading}
            onClick={downloadGrasscutterStableRepo}
            id="grasscutterStableRepo"
          >
            <Tr text="components.download" />
          </BigButton>
        </div>
      </div>
      <div class="DownloadMenuSection" id="downloadMenuContainerGCDevData">
        <div class="DownloadLabel" id="downloadMenuLabelGCDevData">
          <Tr
            text={
              state.grasscutter_set
                ? 'downloads.grasscutter_latest_data'
                : 'downloads.grasscutter_latest_data_update'
            }
          />
          <HelpButton contents="help.gc_dev_data" />
        </div>
        <div class="DownloadValue" id="downloadMenuButtonGCDevData">
          <BigButton
            disabled={state.repo_downloading}
            onClick={downloadGrasscutterStableRepo}
            id="grasscutterDevRepo"
          >
            <Tr text="components.download" />
          </BigButton>
        </div>
      </div>

      <Divider />

      <div class="DownloadMenuSection" id="downloadMenuContainerResources">
        <div class="DownloadLabel" id="downloadMenuLabelResources">
          <Tr text="downloads.resources" />
          <HelpButton contents="help.resources" />
        </div>
        <div class="DownloadValue" id="downloadMenuButtonResources">
          <BigButton
            disabled={state.resources_downloading || !state.grasscutter_set || state.resources_exist}
            onClick={downloadResources}
            id="resourcesBtn"
          >
            <Tr text="components.download" />
          </BigButton>
        </div>
      </div>
    </Menu>
  )
}

