import React from 'react'
import { getMods, ModData } from '../../../utils/gamebanana'
import { LoadingCircle } from './LoadingCircle'

import './ModList.css'
import { ModTile } from './ModTile'

interface IProps {
  mode: string
  addDownload: (mod: ModData) => void
}

interface IState {
  modList: ModData[]
}

export class ModList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.downloadMod = this.downloadMod.bind(this)
  }

  async componentDidMount() {
    if (this.props.mode === 'installed') return

    const mods = await getMods(this.props.mode)

    this.setState({
      modList: mods,
    })
  }

  async downloadMod(mod: ModData) {
    this.props.addDownload(mod)
  }

  render() {
    return (
      <div className="ModList">
        {this.state && this.state.modList ? (
          <div className="ModListInner">
            {this.state.modList.map((mod: ModData) => (
              <ModTile mod={mod} key={mod.id} onClick={this.downloadMod} />
            ))}
          </div>
        ) : (
          <LoadingCircle />
        )}
      </div>
    )
  }
}
