import React from 'react'
import DownloadHandler from '../utils/download'
import TopBar from './components/TopBar'

interface IProps {
  downloadHandler: DownloadHandler
}

interface IState {
  isDownloading: boolean
}

export class Mods extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
  }

  async componentDidMount() {
    return
  }

  render() {
    return (
      <>
        <TopBar />
      </>
    )
  }
}
