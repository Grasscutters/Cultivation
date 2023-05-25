import React from 'react';
import './GamePathNotify.css';

export default class GamePathNotify extends React.Component {
  render() {
    return (
      <div className="GameInstallNotify">
        <span>You need to set your game path in the options!</span>
        <span id="pointer">here ^</span>
      </div>
    );
  }
}