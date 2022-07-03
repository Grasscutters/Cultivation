import React from 'react'

import './Divider.css'

export default class Divider extends React.Component {
  render() {
    return (
      <div className="Divider" id={'dividerContainer'}>
        <div className="DividerLine" id={'dividerLine'}></div>
      </div>
    )
  }
}