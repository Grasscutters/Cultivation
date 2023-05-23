import React from 'react';
import './GamePathNotify.css';

interface IProps {
  isGamePathSet: boolean;
}

interface IState {
  isGamePathSet: boolean,
}



export default class GamePathNotify extends React.Component<IProps, IState>{
  constructor(props: IProps) {
    super(props)
    this.state = {
      isGamePathSet: false,
    }}

  render() {
    const styling = {
      display: this.state.isGamePathSet ? 'none' : 'flex',
    };

    return (
      <div className="GameInstallNotify" style={styling}>
        <>
          <span>You need to set your game path in the options!</span>
          <span id="pointer">here ^</span>
        </>
      </div>
    );
  }
}