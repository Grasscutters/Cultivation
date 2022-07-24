import React from 'react'
import { ModData } from '../../../utils/gamebanana'

import './ModTile.css'
import Like from '../../../resources/icons/like.svg'
import Eye from '../../../resources/icons/eye.svg'

interface IProps {
  mod: ModData
}

export class ModTile extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    const { mod } = this.props

    return (
      <div className="ModListItem">
        <span className="ModName">{mod.name}</span>
        <img src={mod.images[0]} className={mod.nsfw ? 'nsfw' : ''} />
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
