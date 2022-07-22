import React from 'react'

import './ModList.css'

interface IProps {
  sort: string
}

interface IState {
  modList: string[]
}

export class ModList extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    return <div className="ModList"></div>
  }
}
