import React from 'react'
import { getMods } from '../../../utils/gamebanana'
import { LoadingCircle } from './LoadingCircle'

import './ModList.css'

interface IProps {
  mode: string
}

interface IState {
  modList: string[]
}

export class ModList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
  }

  async componentDidMount() {
    if (this.props.mode === 'installed') return

    const mods = await getMods(this.props.mode)

    console.log(mods)
  }

  render() {
    return (
      <div className="ModList">
        <LoadingCircle />
      </div>
    )
  }
}
