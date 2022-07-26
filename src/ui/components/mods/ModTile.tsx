import React from 'react'
import { ModData, PartialModData } from '../../../utils/gamebanana'

import './ModTile.css'
import Like from '../../../resources/icons/like.svg'
import Eye from '../../../resources/icons/eye.svg'
import Download from '../../../resources/icons/download.svg'
import Folder from '../../../resources/icons/folder.svg'
import { shell } from '@tauri-apps/api'
import Checkbox from '../common/Checkbox'

interface IProps {
  mod: ModData | PartialModData
  path?: string
  onClick: (mod: ModData) => void
}

interface IState {
  hover: boolean
  modEnabled: boolean
}

export class ModTile extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      hover: true,
      modEnabled: false,
    }

    this.openInExplorer = this.openInExplorer.bind(this)
    this.toggleMod = this.toggleMod.bind(this)
  }

  async openInExplorer() {
    if (this.props.path) shell.open(this.props.path)
  }

  toggleMod() {
    console.log('Mod toggled')
    this.setState({
      modEnabled: !this.state.modEnabled,
    })
  }

  render() {
    const { mod } = this.props

    return (
      <div
        className="ModListItem"
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: true })}
        {...(!this.props.path && {
          onClick: () => {
            if (!('id' in mod)) return

            this.props.onClick(mod)
          },
        })}
      >
        <span className="ModName">{mod.name}</span>
        <span className="ModAuthor">{mod.submitter.name}</span>
        <div className="ModImage">
          {this.state.hover &&
            (!this.props.path ? (
              <img src={Download} className="ModTileDownload" alt="Download" />
            ) : (
              <div className="ModTileOpen">
                <img src={Folder} className="ModTileFolder" alt="Open" onClick={this.openInExplorer} />
                <Checkbox
                  checked={/* TODO GET INSTALL STATUS */ this.state.modEnabled}
                  id={this.props.mod.name}
                  onChange={this.toggleMod}
                />
              </div>
            ))}
          <img
            src={mod.images[0]}
            className={`ModImageInner ${'id' in mod && mod.nsfw ? 'nsfw' : ''} ${this.state.hover ? 'blur' : ''}`}
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
