import React from 'react'
import { ModData } from '../../../utils/gamebanana'

import './ModTile.css'

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
        <div className="ModInner"></div>
      </div>
    )
  }
}
