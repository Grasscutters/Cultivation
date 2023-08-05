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
import { emit, listen } from '@tauri-apps/api/event'
import HelpButton from '../common/HelpButton'

const FULL_BUILD_DOWNLOAD = 'https://github.com/NotThorny/Grasscutter/releases/download/culti-aio/GrasscutterCulti.zip'
const FULL_QUEST_DOWNLOAD = 'https://github.com/NotThorny/Grasscutter/releases/download/culti-aio/GrasscutterQuests.zip'
const STABLE_REPO_DOWNLOAD = 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/stable.zip'
const DEV_REPO_DOWNLOAD = 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/development.zip'
const DEV_DOWNLOAD = 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/development/Grasscutter.zip'
const RESOURCES_DOWNLOAD = 'https://gitlab.com/api/v4/projects/35984297/repository/archive.zip' // Use Yuuki res as grasscutter crepe res are broken
const MIGOTO_DOWNLOAD =
  'https://github.com/SilentNightSound/GI-Model-Importer/releases/download/V7.0/3dmigoto-GIMI-for-playing-mods.zip'
// Based on V6.0
const MIGOTO_LINUX_DOWNLOAD =
  'https://github.com/MrLGamer/GIMI-for-Linux/releases/download/V1.0/linux-3dmigoto-GIMI-playing.tar.gz'

interface IProps {
  closeFn: () => void
  downloadManager: DownloadHandler
}

interface IState {
  fullbuild_downloading: boolean
  grasscutter_downloading: boolean
  resources_downloading: boolean
  repo_downloading: boolean
  migoto_downloading: boolean
  grasscutter_set: boolean
  resources_exist: boolean
  swag: boolean
}

export default class Downloads extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      fullbuild_downloading: this.props.downloadManager.downloadingFullBuild(),
      grasscutter_downloading: this.props.downloadManager.downloadingJar(),
      resources_downloading: this.props.downloadManager.downloadingResources(),
      repo_downloading: this.props.downloadManager.downloadingRepo(),
      migoto_downloading: this.props.downloadManager.downloadingMigoto(),
      grasscutter_set: false,
      resources_exist: false,
      swag: false,
    }

    this.getGrasscutterFolder = this.getGrasscutterFolder.bind(this)
    this.downloadGrasscutterFullBuild = this.downloadGrasscutterFullBuild.bind(this)
    this.downloadGrasscutterFullQuest = this.downloadGrasscutterFullQuest.bind(this)
    this.downloadGrasscutterStableRepo = this.downloadGrasscutterStableRepo.bind(this)
    this.downloadGrasscutterDevRepo = this.downloadGrasscutterDevRepo.bind(this)
    this.downloadGrasscutterLatest = this.downloadGrasscutterLatest.bind(this)
    this.downloadResources = this.downloadResources.bind(this)
    this.downloadMigoto = this.downloadMigoto.bind(this)
    this.toggleButtons = this.toggleButtons.bind(this)
  }

  async componentDidMount() {
    const gc_path = await getConfigOption('grasscutter_path')
    const swag = await getConfigOption('swag_mode')

    this.setState({
      swag: swag || false,
    })

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

    const path = gc_path.substring(0, gc_path.lastIndexOf('/'))

    if (gc_path) {
      const resources_exist: boolean =
        ((await invoke('dir_exists', {
          path: path + '/resources',
        })) as boolean) &&
        (!(await invoke('dir_is_empty', {
          path: path + '/resources',
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
      folderPath = appdata + 'cultivation/grasscutter'

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

  async getCultivationFolder() {
    const folderPath = (await dataDir()) + 'cultivation'

    return folderPath
  }

  async downloadGrasscutterFullBuild() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(FULL_BUILD_DOWNLOAD, folder + '/GrasscutterCulti.zip', async () => {
      await unzip(folder + '/GrasscutterCulti.zip', folder + '/', true)
      this.toggleButtons()
    })

    this.toggleButtons()
  }

  async downloadGrasscutterFullQuest() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(FULL_QUEST_DOWNLOAD, folder + '/GrasscutterQuests.zip', async () => {
      await unzip(folder + '/GrasscutterQuests.zip', folder + '/', true)
      this.toggleButtons()
    })

    this.toggleButtons()
  }

  async downloadGrasscutterStableRepo() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(STABLE_REPO_DOWNLOAD, folder + '/grasscutter_repo.zip', async () => {
      await unzip(folder + '/grasscutter_repo.zip', folder + '/', true)
      this.toggleButtons()
    })

    this.toggleButtons()
  }

  async downloadGrasscutterDevRepo() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(DEV_REPO_DOWNLOAD, folder + '/grasscutter_repo.zip', async () => {
      await unzip(folder + '/grasscutter_repo.zip', folder + '/', true)
      this.toggleButtons()
    })

    this.toggleButtons()
  }

  async downloadGrasscutterLatest() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(DEV_DOWNLOAD, folder + '/grasscutter.zip', async () => {
      await unzip(folder + '/grasscutter.zip', folder + '/', true)
      this.toggleButtons()
    })

    // Also add repo download
    this.downloadGrasscutterDevRepo()

    this.toggleButtons()
  }

  async downloadResources() {
    // Tell the user this takes some time
    alert(
      'Extracting resources can take time! If your resources appear to be "stuck" extracting for less than 15-20 mins, they likely still are extracting.'
    )
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(RESOURCES_DOWNLOAD, folder + '/resources.zip', async () => {
      // Delete the existing folder if it exists
      if (
        await invoke('dir_exists', {
          path: folder + '/resources',
        })
      ) {
        await invoke('dir_delete', {
          path: folder + '/resources',
        })
      }

      await unzip(folder + '/resources.zip', folder + '/', true)
      // Rename folder to resources
      invoke('rename', {
        path: folder + '/Resources',
        newName: 'resources',
      })

      this.toggleButtons()
    })

    this.toggleButtons()
  }

  async downloadMigoto() {
    const culti_folder = await this.getCultivationFolder()
    const folder = culti_folder + '/3dmigoto'

    if ((await invoke('get_platform')) === 'linux') {
      await invoke('dir_create', {
        path: culti_folder + '/unzipped',
      })

      this.props.downloadManager.addDownload(
        MIGOTO_LINUX_DOWNLOAD,
        culti_folder + '/GIMI-3dmigoto.tar.gz',
        async () => {
          await unzip(culti_folder + '/GIMI-3dmigoto.tar.gz', culti_folder + '/unzipped', true)
          await invoke('dir_move', {
            from: culti_folder + '/unzipped/linux-3dmigoto-GIMI-playing/3dmigoto',
            to: culti_folder + '/3dmigoto',
          })
          await invoke('dir_delete', {
            path: culti_folder + '/unzipped',
          })
          await emit('migoto_extracted', culti_folder + '/3dmigoto/d3d11.dll')
          this.toggleButtons()
        }
      )
    } else {
      await invoke('dir_create', {
        path: folder,
      })

      this.props.downloadManager.addDownload(MIGOTO_DOWNLOAD, folder + '/GIMI-3dmigoto.zip', async () => {
        await unzip(folder + '/GIMI-3dmigoto.zip', folder + '/', true)
        this.toggleButtons()
      })
    }

    this.toggleButtons()
  }

  async toggleButtons() {
    const gc_path = await getConfigOption('grasscutter_path')

    // Set states since we know we are downloading something if this is called
    this.setState({
      fullbuild_downloading: this.props.downloadManager.downloadingFullBuild(),
      grasscutter_downloading: this.props.downloadManager.downloadingJar(),
      resources_downloading: this.props.downloadManager.downloadingResources(),
      repo_downloading: this.props.downloadManager.downloadingRepo(),
      migoto_downloading: this.props.downloadManager.downloadingMigoto(),
      grasscutter_set: gc_path !== '',
    })
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Downloads" heading="Downloads">
        <Divider />

        <div className="HeaderText" id="downloadMenuAIOHeader">
          <Tr text="downloads.aio_header" />
        </div>
        <div className="DownloadMenuSection" id="downloadMenuContainerGCFullBuild">
          <div className="DownloadLabel" id="downloadMenuLabelGCFullBuild">
            <Tr text={'downloads.grasscutter_fullbuild'} />
            <HelpButton contents="help.gc_fullbuild" />
          </div>

          <div className="DownloadValue" id="downloadMenuButtonGCFullBuild">
            <BigButton
              disabled={this.state.grasscutter_downloading}
              onClick={this.downloadGrasscutterFullBuild}
              id="grasscutterFullBuildBtn"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>

        <div className="DownloadMenuSection" id="downloadMenuContainerGCFullQuest">
          <div className="DownloadLabel" id="downloadMenuLabelGCFullQuest">
            <Tr text={'downloads.grasscutter_fullquest'} />
            <HelpButton contents="help.gc_fullbuild" />
          </div>
          <div className="DownloadValue" id="downloadMenuButtonGCFullQuest">
            <BigButton
              disabled={this.state.grasscutter_downloading}
              onClick={this.downloadGrasscutterFullQuest}
              id="grasscutterFullBuildBtn"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
        <Divider />

        <div className="HeaderText" id="downloadMenuIndividualHeader">
          <Tr text="downloads.individual_header" />
        </div>
        <div className="DownloadMenuSection" id="downloadMenuContainerGCDev">
          <div className="DownloadLabel" id="downloadMenuLabelGCDev">
            <Tr
              text={this.state.grasscutter_set ? 'downloads.grasscutter_latest' : 'downloads.grasscutter_latest_update'}
            />
            <HelpButton contents="help.gc_dev_jar" />
          </div>
          <div className="DownloadValue" id="downloadMenuButtonGCDev">
            <BigButton
              disabled={this.state.grasscutter_downloading}
              onClick={this.downloadGrasscutterLatest}
              id="grasscutterLatestBtn"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>

        <div className="DownloadMenuSection" id="downloadMenuContainerGCDevData">
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
          <div className="DownloadValue" id="downloadMenuButtonGCDevData">
            <BigButton
              disabled={this.state.repo_downloading}
              onClick={this.downloadGrasscutterStableRepo}
              id="grasscutterDevRepo"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>

        <div className="DownloadMenuSection" id="downloadMenuContainerResources">
          <div className="DownloadLabel" id="downloadMenuLabelResources">
            <Tr text="downloads.resources" />
            <HelpButton contents="help.resources" />
          </div>
          <div className="DownloadValue" id="downloadMenuButtonResources">
            <BigButton
              disabled={this.state.resources_downloading || !this.state.grasscutter_set || this.state.resources_exist}
              onClick={this.downloadResources}
              id="resourcesBtn"
            >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>

        {this.state.swag && (
          <>
            <Divider />
            <div className="HeaderText" id="downloadMenuModsHeader">
              <Tr text="downloads.mods_header" />
            </div>
            <div className="DownloadMenuSection" id="downloadMenuContainerMigoto">
              <div className="DownloadLabel" id="downloadMenuLabelMigoto">
                <Tr text={'downloads.migoto'} />
                <HelpButton contents="help.migoto" />
              </div>
              <div className="DownloadValue" id="downloadMenuButtonMigoto">
                <BigButton disabled={this.state.migoto_downloading} onClick={this.downloadMigoto} id="migotoBtn">
                  <Tr text="components.download" />
                </BigButton>
              </div>
            </div>
          </>
        )}
      </Menu>
    )
  }
}
