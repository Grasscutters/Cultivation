import React from 'react'
import { getMods, ModData } from '../../../utils/gamebanana'
import { LoadingCircle } from './LoadingCircle'

import './ModList.css'
import { ModTile } from './ModTile'

interface IProps {
  mode: string
}

interface IState {
  modList: ModData[]
}

export class ModList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
  }

  async componentDidMount() {
    if (this.props.mode === 'installed') return

    const mods = await getMods(this.props.mode)

    this.setState({
      modList: mods,
    })
  }

  render() {
    return (
      <div className="ModList">
        {this.state && this.state.modList ? (
          <div className="ModListInner">
            {this.state.modList.map((mod: ModData) => (
              <ModTile mod={mod} key={mod.id} />
            ))}
          </div>
        ) : (
          <LoadingCircle />
        )}
      </div>
    )
  }
}
