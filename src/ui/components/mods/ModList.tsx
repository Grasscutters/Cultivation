import React from 'react'
import { invoke } from '@tauri-apps/api'
import { getInstalledMods, getMods, ModData, PartialModData } from '../../../utils/gamebanana'
import { LoadingCircle } from './LoadingCircle'

import './ModList.css'
import { ModTile } from './ModTile'

interface IProps {
  mode: string
  addDownload: (mod: ModData) => void
}

interface IState {
  modList: ModData[] | null
  installedList: InstalledMod[] | null
}

interface InstalledMod {
  path: string
  info: ModData | PartialModData
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

    const mods = await getMods(this.props.mode)

    this.setState({
      modList: mods,
    })
  }

  async downloadMod(mod: ModData) {
    this.props.addDownload(mod)
  }

  async getImg(mod: InstalledMod) {
    const pattern = /(http|https):\/\/([\w.]+\/?)\S*/
    let imgurl = mod.info.images[0]
    if (!pattern.test(imgurl)) {
      const contents = await invoke<string>('read_local_img', { path: mod.path })
      if (contents.length > 0) {
        imgurl = contents
      }
    }
    return imgurl
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
                    path={mod.path}
                    mod={mod.info}
                    key={mod.info.name}
                    imgUrl={this.getImg(mod)}
                    onClick={this.downloadMod}
                  />
                ))
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
