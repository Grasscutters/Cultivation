import React from 'react'
import { ModData } from '../../../utils/gamebanana'

import './ModTile.css'
import Like from '../../../resources/icons/like.svg'
import Eye from '../../../resources/icons/eye.svg'
import Download from '../../../resources/icons/download.svg'

interface IProps {
  mod: ModData
}

interface IState {
  hover: boolean
}

export class ModTile extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      hover: false,
    }
  }

  render() {
    const { mod } = this.props

    return (
      <div
        className="ModListItem"
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        <span className="ModName">{mod.name}</span>
        <span className="ModAuthor">{mod.submitter.name}</span>
        <div className="ModImage">
          {this.state.hover && <img src={Download} className="ModTileDownload" alt="Download" />}
          <img src={mod.images[0]} className={`${mod.nsfw ? 'nsfw' : ''} ${this.state.hover ? 'blur' : ''}`} />
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
