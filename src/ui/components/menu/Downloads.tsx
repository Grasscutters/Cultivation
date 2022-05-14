import React from 'react'
import Menu from './Menu'
import Tr from '../../../utils/language'
import DownloadHandler from '../../../utils/download'
import BigButton from '../common/BigButton'

import './Downloads.css'
import Divider from './Divider'

interface IProps {
  closeFn: () => void;
  downloadManager: DownloadHandler;
}

interface IState {
  grasscutter_downloading: boolean
  resources_downloading: boolean
}

export default class Downloads extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      grasscutter_downloading: false,
      resources_downloading: false
    }
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Downloads" heading="Downloads">
        <div className='DownloadSection'>
          <div className='DownloadLabel'>
            <Tr text="downloads.grasscutter_stable" />
          </div>
          <div className='DownloadValue'>
            <BigButton onClick={() => console.log('download')} id="grasscutterStableBtn" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
        <div className='DownloadSection'>
          <div className='DownloadLabel'>
            <Tr text="downloads.grasscutter_latest" />
          </div>
          <div className='DownloadValue'>
            <BigButton onClick={() => console.log('download')} id="grasscutterLatestBtn" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>

        <Divider />

        <div className='DownloadSection'>
          <div className='DownloadLabel'>
            <Tr text="downloads.resources" />
          </div>
          <div className='DownloadValue'>
            <BigButton onClick={() => console.log('download')} id="resourcesBtn" >
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
      </Menu>
    )
  }
}