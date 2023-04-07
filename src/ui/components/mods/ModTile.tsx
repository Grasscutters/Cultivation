import React from 'react'
import { ModData, PartialModData } from '../../../utils/gamebanana'
import { getConfigOption } from '../../../utils/configuration'

import './ModTile.css'
import Like from '../../../resources/icons/like.svg'
import Eye from '../../../resources/icons/eye.svg'
import Download from '../../../resources/icons/download.svg'
import Folder from '../../../resources/icons/folder.svg'
import { shell } from '@tauri-apps/api'
import Checkbox from '../common/Checkbox'
import { disableMod, enableMod, modIsEnabled } from '../../../utils/mods'

interface IProps {
  mod: ModData | PartialModData
  horny?: boolean
  path?: string
  onClick: (mod: ModData) => void
}

interface IState {
  horny: boolean
  hover: boolean
  modEnabled: boolean
}

export class ModTile extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      horny: false,
      hover: false,
      modEnabled: false,
    }

    this.openInExplorer = this.openInExplorer.bind(this)
    this.toggleMod = this.toggleMod.bind(this)
  }

  getModFolderName() {
    if (!('id' in this.props.mod)) {
      return this.props.mod.name.includes('DISABLED_') ? this.props.mod.name.split('DISABLED_')[1] : this.props.mod.name
    }

    return String(this.props.mod.id)
  }

  async componentDidMount() {
    const horny = await getConfigOption('horny_mode')

    if (!('id' in this.props.mod)) {
      // Partial mod
      this.setState({
        modEnabled: await modIsEnabled(this.props.mod.name),
        horny,
      })

      return
    }

    this.setState({
      modEnabled: await modIsEnabled(String(this.props.mod.id)),
      horny,
    })
  }

  async openInExplorer() {
    if (this.props.path) shell.open(this.props.path)
  }

  toggleMod() {
    this.setState(
      {
        modEnabled: !this.state.modEnabled,
        horny: !this.state.horny,
      },
      () => {
        if (this.state.modEnabled) {
          enableMod(String(this.getModFolderName()))
          return
        }

        disableMod(String(this.getModFolderName()))
      }
    )
  }

  render() {
    const { mod } = this.props

    return (
      <div
        className="ModListItem"
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        {...(!this.props.path && {
          onClick: () => {
            if (!('id' in mod)) return

            this.props.onClick(mod)
          },
        })}
      >
        <span className="ModName">{mod.name.includes('DISABLED_') ? mod.name.split('DISABLED_')[1] : mod.name}</span>
        <span className="ModAuthor">{mod.submitter.name}</span>
        <div className="ModImage">
          {this.state.hover &&
            (!this.props.path ? (
              <img src={Download} className="ModTileDownload" alt="Download" />
            ) : (
              <div className="ModTileOpen">
                <img src={Folder} className="ModTileFolder" alt="Open" onClick={this.openInExplorer} />
                <Checkbox checked={this.state.modEnabled} id={this.props.mod.name} onChange={this.toggleMod} />
              </div>
            ))}
          <img
            src={mod.images[0]}
            className={`ModImageInner ${'id' in mod && !this.state.horny && mod.nsfw ? 'nsfw' : ''} ${
              this.state.hover ? 'blur' : ''
            }`}
          />
        </div>
        <div className="ModInner">
          <div className="likes">
            <img src={Like} />
            <span>{mod.likes.toLocaleString()}</span>
          </div>
          <div className="views">
            <img src={Eye} />
            <span>{mod.views.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }
}
