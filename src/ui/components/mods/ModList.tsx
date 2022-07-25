import React from 'react'
import { getInstalledMods, getMods, ModData } from '../../../utils/gamebanana'
import { LoadingCircle } from './LoadingCircle'

import './ModList.css'
import { ModTile } from './ModTile'

interface IProps {
  mode: string
  addDownload: (mod: ModData) => void
}

interface IState {
  modList: ModData[] | null
  installedList:
    | {
        path: string
        info: unknown
      }[]
    | null
}

export class ModList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      modList: null,
      installedList: null,
    }

    this.downloadMod = this.downloadMod.bind(this)
  }

  async componentDidMount() {
    if (this.props.mode === 'installed') {
      const installedMods = await getInstalledMods()

      console.log(installedMods)

      this.setState({
        installedList: installedMods,
      })

      return
    }

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
        {(this.state.modList && this.props.mode !== 'installed') ||
        (this.state.installedList && this.props.mode === 'installed') ? (
          <div className="ModListInner">
            {this.props.mode === 'installed'
              ? this.state.installedList?.map((mod) => <></>)
              : this.state.modList?.map((mod: ModData) => (
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
