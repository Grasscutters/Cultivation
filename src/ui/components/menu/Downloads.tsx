import React from 'react'
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

export default class Downloads extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      grasscutter_downloading: this.props.downloadManager.downloadingJar(),
      resources_downloading: this.props.downloadManager.downloadingResources(),
      repo_downloading: this.props.downloadManager.downloadingRepo(),
      grasscutter_set: false,
      resources_exist: false,
    }

    this.getGrasscutterFolder = this.getGrasscutterFolder.bind(this)
    this.downloadGrasscutterStableRepo = this.downloadGrasscutterStableRepo.bind(this)
    this.downloadGrasscutterDevRepo = this.downloadGrasscutterDevRepo.bind(this)
    this.downloadGrasscutterStable = this.downloadGrasscutterStable.bind(this)
    this.downloadGrasscutterLatest = this.downloadGrasscutterLatest.bind(this)
    this.downloadResources = this.downloadResources.bind(this)
    this.toggleButtons = this.toggleButtons.bind(this)
  }

  async componentDidMount() {
    const gc_path = await getConfigOption('grasscutter_path')

    listen('jar_extracted', () => {
      this.setState({ grasscutter_set: true }, this.forceUpdate)
    })

    if (!gc_path || gc_path === '') {
      this.setState({
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

      this.setState({
        grasscutter_set: gc_path !== '',
        resources_exist,
      })
    }
  }

  async getGrasscutterFolder() {
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

  async downloadGrasscutterStableRepo() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(STABLE_REPO_DOWNLOAD, folder + '\\grasscutter_repo.zip', async () => {
      await unzip(folder + '\\grasscutter_repo.zip', folder + '\\', true)
      this.toggleButtons()
    })

    this.toggleButtons()
  }

  async downloadGrasscutterDevRepo() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(DEV_REPO_DOWNLOAD, folder + '\\grasscutter_repo.zip', async () => {
      await unzip(folder + '\\grasscutter_repo.zip', folder + '\\', true)
      this.toggleButtons()
    })

    this.toggleButtons()
  }

  async downloadGrasscutterStable() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(STABLE_DOWNLOAD, folder + '\\grasscutter.zip', async () => {
      await unzip(folder + '\\grasscutter.zip', folder + '\\', true)
      this.toggleButtons()
    })

    // Also add repo download
    this.downloadGrasscutterStableRepo()

    this.toggleButtons()
  }

  async downloadGrasscutterLatest() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(DEV_DOWNLOAD, folder + '\\grasscutter.zip', async () => {
      await unzip(folder + '\\grasscutter.zip', folder + '\\', true)
      this.toggleButtons()
    })

    // Also add repo download
    this.downloadGrasscutterDevRepo()

    this.toggleButtons()
  }

  async downloadResources() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(RESOURCES_DOWNLOAD, folder + '\\resources.zip', async () => {
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

      this.toggleButtons()
    })

    this.toggleButtons()
  }

  async toggleButtons() {
    const gc_path = await getConfigOption('grasscutter_path')

    // Set states since we know we are downloading something if this is called
    this.setState({
      grasscutter_downloading: this.props.downloadManager.downloadingJar(),
      resources_downloading: this.props.downloadManager.downloadingResources(),
      repo_downloading: this.props.downloadManager.downloadingRepo(),
      grasscutter_set: gc_path !== '',
    })
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="downloads" heading="Downloads">
        <div className="downloadMenuSection" id="downloadMenuContainerGCStable">
          <div className="DownloadLabel" id="downloadMenuLabelGCStable">
            <Tr
              text={this.state.grasscutter_set ? 'downloads.grasscutter_stable' : 'downloads.grasscutter_stable_update'}
            />
            <HelpButton contents="help.gc_stable_jar" />
          </div>
          <div className="downloadValue" id="downloadMenuButtonGCStable">
            <BigButton
              disabled={this.state.grasscutter_downloading}
              onClick={this.downloadGrasscutterStable}
              id="grasscutterStableBtn"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
        <div className="downloadMenuSection" id="downloadMenuContainerGCDev">
          <div className="DownloadLabel" id="downloadMenuLabelGCDev">
            <Tr
              text={this.state.grasscutter_set ? 'downloads.grasscutter_latest' : 'downloads.grasscutter_latest_update'}
            />
            <HelpButton contents="help.gc_dev_jar" />
          </div>
          <div className="downloadValue" id="downloadMenuButtonGCDev">
            <BigButton
              disabled={this.state.grasscutter_downloading}
              onClick={this.downloadGrasscutterLatest}
              id="grasscutterLatestBtn"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>

        <Divider />

        <div className="downloadMenuSection" id="downloadMenuContainerGCStableData">
          <div className="DownloadLabel" id="downloadMenuLabelGCStableData">
            <Tr
              text={
                this.state.grasscutter_set
                  ? 'downloads.grasscutter_stable_data'
                  : 'downloads.grasscutter_stable_data_update'
              }
            />
            <HelpButton contents="help.gc_stable_data" />
          </div>
          <div className="downloadValue" id="downloadMenuButtonGCStableData">
            <BigButton
              disabled={this.state.repo_downloading}
              onClick={this.downloadGrasscutterStableRepo}
              id="grasscutterStableRepo"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
        <div className="downloadMenuSection" id="downloadMenuContainerGCDevData">
          <div className="DownloadLabel" id="downloadMenuLabelGCDevData">
            <Tr
              text={
                this.state.grasscutter_set
                  ? 'downloads.grasscutter_latest_data'
                  : 'downloads.grasscutter_latest_data_update'
              }
            />
            <HelpButton contents="help.gc_dev_data" />
          </div>
          <div className="downloadValue" id="downloadMenuButtonGCDevData">
            <BigButton
              disabled={this.state.repo_downloading}
              onClick={this.downloadGrasscutterStableRepo}
              id="grasscutterDevRepo"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>

        <Divider />

        <div className="downloadMenuSection" id="downloadMenuContainerResources">
          <div className="DownloadLabel" id="downloadMenuLabelResources">
            <Tr text="downloads.resources" />
            <HelpButton contents="help.resources" />
          </div>
          <div className="downloadValue" id="downloadMenuButtonResources">
            <BigButton
              disabled={this.state.resources_downloading || !this.state.grasscutter_set || this.state.resources_exist}
              onClick={this.downloadResources}
              id="resourcesBtn"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
      </Menu>
    )
  }
}
