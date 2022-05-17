import React from 'react'
import Menu from './Menu'
import Tr from '../../../utils/language'
import DownloadHandler from '../../../utils/download'
import { unzip } from '../../../utils/zip_utils'
import BigButton from '../common/BigButton'
import { dataDir } from '@tauri-apps/api/path'

import './Downloads.css'
import Divider from './Divider'
import { getConfigOption, setConfigOption } from '../../../utils/configuration'
import { invoke } from '@tauri-apps/api'

const STABLE_REPO_DOWNLOAD = 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/stable.zip'
const DEV_REPO_DOWNLOAD = 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/development.zip'
const STABLE_DOWNLOAD = 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/stable/Grasscutter.zip'
const DEV_DOWNLOAD = 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/development/Grasscutter.zip'
const RESOURCES_DOWNLOAD = 'https://github.com/Koko-boya/Grasscutter_Resources/archive/refs/heads/main.zip'

interface IProps {
  closeFn: () => void;
  downloadManager: DownloadHandler;
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
      resources_exist: false
    }

    this.getGrasscutterFolder = this.getGrasscutterFolder.bind(this)
    this.downloadGrasscutterStableRepo = this.downloadGrasscutterStableRepo.bind(this)
    this.downloadGrasscutterDevRepo = this.downloadGrasscutterDevRepo.bind(this)
    this.downloadGrasscutterStable = this.downloadGrasscutterStable.bind(this)
    this.downloadGrasscutterLatest = this.downloadGrasscutterLatest.bind(this)
    this.downloadResources = this.downloadResources.bind(this)
    this.disableButtons = this.disableButtons.bind(this)
  }

  async componentDidMount() {
    const gc_path = await getConfigOption('grasscutter_path')

    if (!gc_path || gc_path === '') {
      this.setState({
        grasscutter_set: false,
        resources_exist: false
      })

      return
    }

    const path = gc_path.substring(0, gc_path.lastIndexOf('\\'))

    if (gc_path) {
      const resources_exist: boolean = await invoke('dir_exists', {
        path: path + '\\resources'
      })

      this.setState({
        grasscutter_set: gc_path !== '',
        resources_exist
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
    this.props.downloadManager.addDownload(STABLE_REPO_DOWNLOAD, folder + '\\grasscutter_repo.zip', () =>{
      unzip(folder + '\\grasscutter_repo.zip', folder + '\\')
    })

    this.disableButtons()
  }

  async downloadGrasscutterDevRepo() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(DEV_REPO_DOWNLOAD, folder + '\\grasscutter_repo.zip', () =>{
      unzip(folder + '\\grasscutter_repo.zip', folder + '\\')
    })

    this.disableButtons()
  }

  async downloadGrasscutterStable() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(STABLE_DOWNLOAD, folder + '\\grasscutter.zip', () =>{
      unzip(folder + '\\grasscutter.zip', folder + '\\')
    })

    // Also add repo download
    this.downloadGrasscutterStableRepo()

    this.disableButtons()
  } 

  async downloadGrasscutterLatest() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(DEV_DOWNLOAD, folder + '\\grasscutter.zip', () =>{
      unzip(folder + '\\grasscutter.zip', folder + '\\')
    })

    // Also add repo download
    this.downloadGrasscutterDevRepo()

    this.disableButtons()
  }

  async downloadResources() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(RESOURCES_DOWNLOAD, folder + '\\resources.zip', async () => {
      await unzip(folder + '\\resources.zip', folder + '\\', () => {
        // Rename folder to resources
        invoke('rename', {
          path: folder + '\\Resources',
          newName: 'resources'
        })
      })
    })

    this.disableButtons()
  }

  disableButtons() {
    // Set states since we know we are downloading something if this is called
    this.setState({
      grasscutter_downloading: this.props.downloadManager.downloadingJar(),
      resources_downloading: this.props.downloadManager.downloadingResources(),
      repo_downloading: this.props.downloadManager.downloadingRepo()
    })
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Downloads" heading="Downloads">
        <div className='DownloadMenuSection'>
          <div className='DownloadLabel'>
            <Tr text={
              this.state.grasscutter_set ? 'downloads.grasscutter_stable' : 'downloads.grasscutter_stable_update'
            } />
          </div>
          <div className='DownloadValue'>
            <BigButton disabled={this.state.grasscutter_downloading} onClick={this.downloadGrasscutterStable} id="grasscutterStableBtn" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
        <div className='DownloadMenuSection'>
          <div className='DownloadLabel'>
            <Tr text={
              this.state.grasscutter_set ? 'downloads.grasscutter_latest' : 'downloads.grasscutter_latest_update'
            } />
          </div>
          <div className='DownloadValue'>
            <BigButton disabled={this.state.grasscutter_downloading} onClick={this.downloadGrasscutterLatest} id="grasscutterLatestBtn" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>

        <Divider />

        <div className='DownloadMenuSection'>
          <div className='DownloadLabel'>
            <Tr text={
              this.state.grasscutter_set ? 'downloads.grasscutter_stable_data' : 'downloads.grasscutter_stable_data_update'
            } />
          </div>
          <div className='DownloadValue'>
            <BigButton disabled={this.state.repo_downloading} onClick={this.downloadGrasscutterStableRepo} id="grasscutterStableRepo" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
        <div className='DownloadMenuSection'>
          <div className='DownloadLabel'>
            <Tr text={
              this.state.grasscutter_set ? 'downloads.grasscutter_latest_data' : 'downloads.grasscutter_latest_data_update'
            } />
          </div>
          <div className='DownloadValue'>
            <BigButton disabled={this.state.repo_downloading} onClick={this.downloadGrasscutterStableRepo} id="grasscutterDevRepo" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>

        <Divider />

        <div className='DownloadMenuSection'>
          <div className='DownloadLabel'>
            <Tr text="downloads.resources" />
          </div>
          <div className='DownloadValue'>
            <BigButton disabled={this.state.resources_downloading || !this.state.grasscutter_set || this.state.resources_exist} onClick={this.downloadResources} id="resourcesBtn" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
      </Menu>
    )
  }
}