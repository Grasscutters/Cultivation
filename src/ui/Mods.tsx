import { invoke } from '@tauri-apps/api'
import React from 'react'
import DownloadHandler from '../utils/download'
import { getModDownload, ModData } from '../utils/gamebanana'
import { getModsFolder } from '../utils/mods'
import { unzip } from '../utils/zipUtils'
import ProgressBar from './components/common/MainProgressBar'
import { ModHeader } from './components/mods/ModHeader'
import { ModList } from './components/mods/ModList'
import TopBar from './components/TopBar'

import './Mods.css'

interface IProps {
  downloadHandler: DownloadHandler
}

interface IState {
  isDownloading: boolean
  category: string
}

const headers = [
  {
    name: 'ripe',
    title: 'Hot',
  },
  {
    name: 'new',
    title: 'New',
  },
  {
    name: 'installed',
    title: 'Installed',
  },
]

export class Mods extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      isDownloading: false,
      category: '',
    }

    this.setCategory = this.setCategory.bind(this)
    this.addDownload = this.addDownload.bind(this)
  }

  async componentDidMount() {
    return
  }

  async addDownload(mod: ModData) {
    console.log('Downloading:', mod.name)

    const modFolder = await getModsFolder()
    const modPath = `${modFolder}${mod.id}.zip`
    const dlLinks = await getModDownload(String(mod.id))

    if (!modFolder || dlLinks.length === 0) return

    // Not gonna bother allowing sorting for now
    const firstLink = dlLinks[0].downloadUrl

    this.props.downloadHandler.addDownload(firstLink, modPath, async () => {
      const unzipRes = await unzip(modPath, modFolder, false)

      // Write a modinfo.json file
      invoke('write_file', {
        path: `${unzipRes.new_folder}/modinfo.json`,
        contents: JSON.stringify(mod),
      })
    })
  }

  async setCategory(value: string) {
    this.setState(
      {
        category: value,
      },
      this.forceUpdate
    )
  }

  render() {
    return (
      <div className="Mods">
        <TopBar />

        <div className="TopDownloads">
          <ProgressBar downloadManager={this.props.downloadHandler} />
        </div>

        <ModHeader onChange={this.setCategory} headers={headers} defaultHeader={'ripe'} />

        <ModList key={this.state.category} mode={this.state.category} addDownload={this.addDownload} />
      </div>
    )
  }
}
