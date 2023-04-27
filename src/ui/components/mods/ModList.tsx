import React from 'react'
import { getConfigOption } from '../../../utils/configuration'
import { getInstalledMods, getMods, ModData, PartialModData } from '../../../utils/gamebanana'
import { LoadingCircle } from './LoadingCircle'

import './ModList.css'
import { ModTile } from './ModTile'

interface IProps {
  mode: string
  page: number
  search: string
  addDownload: (mod: ModData) => void
}

interface IState {
  horny: boolean
  modList: ModData[] | null
  installedList:
    | {
        path: string
        info: ModData | PartialModData
      }[]
    | null
}

export class ModList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      horny: false,
      modList: null,
      installedList: null,
    }

    this.downloadMod = this.downloadMod.bind(this)
  }

  async componentDidMount() {
    if (this.props.mode === 'installed') {
      const installedMods = (await getInstalledMods()).map((mod) => {
        // Check if it's a partial mod, and if so, fill in some pseudo-data
        if (!('id' in mod.info)) {
          const newInfo = mod.info as PartialModData

          newInfo.images = []
          newInfo.submitter = { name: 'Unknown' }
          newInfo.likes = 0
          newInfo.views = 0

          mod.info = newInfo

          return mod
        }

        return mod
      })

      this.setState({
        installedList: installedMods,
      })

      return
    }

    const mods = await getMods(this.props.mode, this.props.page, this.props.search)

    const horny = await getConfigOption('horny_mode')

    this.setState({
      horny,
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
              ? this.state.installedList?.map((mod) => (
                  <ModTile
                    horny={this.state.horny}
                    path={mod.path}
                    mod={mod.info}
                    key={mod.info.name}
                    onClick={this.downloadMod}
                  />
                ))
              : this.state.modList?.map((mod: ModData) => (
                  <ModTile horny={this.state.horny} mod={mod} key={mod.id} onClick={this.downloadMod} />
                ))}
          </div>
        ) : (
          <LoadingCircle />
        )}
      </div>
    )
  }
}
