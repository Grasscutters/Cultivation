import React from 'react'
import Menu from './Menu'
import Tr from '../../../utils/language'
import DownloadHandler from '../../../utils/download'
import { unzip } from '../../../utils/zip_utils'
import BigButton from '../common/BigButton'

import './Downloads.css'
import Divider from './Divider'
import { getConfigOption } from '../../../utils/configuration'

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
  grasscutter_set: boolean
}

export default class Downloads extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      grasscutter_downloading: this.props.downloadManager.downloadingJar(),
      resources_downloading: this.props.downloadManager.downloadingResources(),
      grasscutter_set: false
    }

    this.getGrasscutterFolder = this.getGrasscutterFolder.bind(this)
    this.downloadGrasscutterStable = this.downloadGrasscutterStable.bind(this)
    this.downloadGrasscutterLatest = this.downloadGrasscutterLatest.bind(this)
    this.downloadResources = this.downloadResources.bind(this)
    this.disableButtons = this.disableButtons.bind(this)
  }

  async componentDidMount() {
    const gc_path = await getConfigOption('grasscutter_path')
    if (gc_path) {
      this.setState({
        grasscutter_set: gc_path !== ''
      })
    }
  }

  async getGrasscutterFolder() {
    const path = await getConfigOption('grasscutter_path')
    let folderPath

    if (path.includes('/')) {
      folderPath = path.substring(0, path.lastIndexOf('/'))
    } else {
      folderPath = path.substring(0, path.lastIndexOf('\\'))
    }

    return folderPath
  }

  async downloadGrasscutterStable() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(STABLE_DOWNLOAD, folder + '\\grasscutter.zip')

    this.disableButtons()
  } 

  async downloadGrasscutterLatest() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(DEV_DOWNLOAD, folder + '\\grasscutter.zip')

    this.disableButtons()
  }

  async downloadResources() {
    const folder = await this.getGrasscutterFolder()
    this.props.downloadManager.addDownload(RESOURCES_DOWNLOAD, folder + '\\resources.zip', () => {
      unzip(folder + '\\resources.zip', 'Grasscutter_Resources/Resources/', folder + '/resources')
    })

    this.disableButtons()
  }

  disableButtons() {
    // Set states since we know we are downloading something if this is called
    this.setState({
      grasscutter_downloading: this.props.downloadManager.downloadingJar(),
      resources_downloading: this.props.downloadManager.downloadingResources()
    })
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Downloads" heading="Downloads">
        <div className='DownloadMenuSection'>
          <div className='DownloadLabel'>
            <Tr text="downloads.grasscutter_stable" />
          </div>
          <div className='DownloadValue'>
            <BigButton disabled={this.state.grasscutter_downloading} onClick={this.downloadGrasscutterStable} id="grasscutterStableBtn" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
        <div className='DownloadMenuSection'>
          <div className='DownloadLabel'>
            <Tr text="downloads.grasscutter_latest" />
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
            <Tr text="downloads.resources" />
          </div>
          <div className='DownloadValue'>
            <BigButton disabled={this.state.resources_downloading || !this.state.grasscutter_set} onClick={this.downloadResources} id="resourcesBtn" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
      </Menu>
    )
  }
}