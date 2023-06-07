import React from 'react'
import './GamePathNotify.css'
import Tr from '../../../utils/language'

export default class GamePathNotify extends React.Component {
  render() {
    return (
      <div className="GameInstallNotify">
        <span>
          <Tr text={'main.game_path_notify'} />
        </span>
      </div>
    )
  }
}
