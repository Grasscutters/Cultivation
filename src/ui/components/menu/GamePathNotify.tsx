import React from 'react';
import './GamePathNotify.css';

// interface IProps {
//   // isGamePathSet: boolean;
// }

export default class GamePathNotify extends React.Component{
  render() {
    //const { isGamePathSet } = this.props;

    // const styling = {
    //   display: isGamePathSet ? 'none' : 'flex',
    // };

    return (
      <div className="GameInstallNotify" /*style={styling}*/>
        <>
          <span>You need to set your game path in the options!</span>
          <span id="pointer">here ^</span>
        </>
      </div>
    );
  }
}