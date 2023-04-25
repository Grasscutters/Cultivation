import React from 'react'

import './ModPages.css'

interface IProps {
  headers: {
    title: string
    name: number
  }[]
  onClick: (value: number) => void
  defaultHeader: number
}

interface IState {
  selected: number
}

export class ModPages extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      selected: this.props.defaultHeader,
    }
  }

  setSelected(value: number) {
    const current = this.state.selected
    if (current + value == 0) return
    this.setState({
      selected: current + value,
    })

    this.props.onClick(value)
  }

  render() {
    return (
      <div className="ModPages">
        {this.props.headers.map((header, index) => {
          return (
            <div
              key={index}
              className={`ModPagesTitle ${this.state.selected === header.name ? 'selected' : ''}`}
              onClick={() => this.setSelected(header.name)}
            >
              {header.title}
            </div>
          )
        })}
      </div>
    )
  }
}
