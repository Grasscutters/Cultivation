import React from 'react'

import './ModHeader.css'

interface IProps {
  headers: {
    title: string
    name: string
  }[]
  onChange: (value: string) => void
  defaultHeader: string
}

interface IState {
  selected: string
}

export class ModHeader extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      selected: this.props.defaultHeader,
    }
  }

  setSelected(value: string) {
    this.setState({
      selected: value,
    })

    this.props.onChange(value)
  }

  render() {
    return (
      <div className="ModHeader">
        {this.props.headers.map((header, index) => {
          return (
            <div
              key={index}
              className={`ModHeaderTitle ${this.state.selected === header.name ? 'selected' : ''}`}
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
