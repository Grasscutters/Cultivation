import React from 'react'

import './MiniDialog.css'

interface IProps {
  children: React.ReactNode[] | React.ReactNode;
}

export default class MiniDialog extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    return (
      <div className="MiniDialog">
        {this.props.children}
      </div>
    )
  }
}