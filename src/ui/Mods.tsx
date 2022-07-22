import React from 'react'
import DownloadHandler from '../utils/download'
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
    name: 'hot',
    title: 'Hot',
  },
  {
    name: 'new',
    title: 'New',
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

  async setCategory(value: string) {
    this.setState({
      category: value,
    })
  }

  render() {
    return (
      <div className="Mods">
        <TopBar />

        <ModHeader onChange={this.setCategory} headers={headers} defaultHeader={'hot'} />

        <ModList sort={this.state.category} />
      </div>
    )
  }
}
