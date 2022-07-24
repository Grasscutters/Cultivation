import React from 'react'
import DownloadHandler from '../utils/download'
import { ModData } from '../utils/gamebanana'
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
  }

  async componentDidMount() {
    return
  }

  async addDownload(mod: ModData) {
    console.log('Downloading:', mod.name)
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

        <ModHeader onChange={this.setCategory} headers={headers} defaultHeader={'ripe'} />

        <ModList key={this.state.category} mode={this.state.category} addDownload={this.addDownload} />
      </div>
    )
  }
}
