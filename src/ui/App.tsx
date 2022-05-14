import React from 'react'
import { listen } from '@tauri-apps/api/event'
import './App.css'

import DownloadHandler from '../utils/download'

// Major Components
import TopBar from './components/TopBar'
import ServerLaunchSection from './components/ServerLaunchSection'
import MainProgressBar from './components/common/MainProgressBar'
import Options from './components/menu/Options'
import MiniDialog from './components/MiniDialog'
import DownloadList from './components/common/DownloadList'
import Downloads from './components/menu/Downloads'
import NewsSection from './components/news/NewsSection'

interface IProps {
  [key: string]: never;
}

interface IState {
  isDownloading: boolean;
  optionsOpen: boolean;
  miniDownloadsOpen: boolean;
  downloadsOpen: boolean;
}

const downloadHandler = new DownloadHandler()

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      isDownloading: false,
      optionsOpen: false,
      miniDownloadsOpen: false,
      downloadsOpen: false
    }

    listen('lang_error', (payload) => {
      console.log(payload)
    })
  }

  render() {
    return (
      <div className="App">
        <TopBar
          optFunc={() => {
            this.setState({ optionsOpen: !this.state.optionsOpen })
          }}
          downFunc={() => this.setState({ downloadsOpen: !this.state.downloadsOpen })}
        />

        <NewsSection />

        {
          // Mini downloads section
          this.state.miniDownloadsOpen ? 
            <div className="MiniDownloads">
              <MiniDialog title="Downloads" closeFn={() => {
                this.setState({ miniDownloadsOpen: false })
              }}>
                <DownloadList downloadManager={downloadHandler} />
              </MiniDialog>
              <div className="arrow-down"></div>
            </div> : null
        }

        {
          // Download menu
          this.state.downloadsOpen ? <Downloads downloadManager={downloadHandler} closeFn={() => this.setState({ downloadsOpen: false }) } /> : null
        }

        {
          // Options menu
          this.state.optionsOpen ? <Options closeFn={() => this.setState({ optionsOpen: !this.state.optionsOpen })}/> : null
        }

        <ServerLaunchSection />

        <div id="DownloadProgress"
          onClick={() => this.setState({ miniDownloadsOpen: !this.state.miniDownloadsOpen })}
        >
          <MainProgressBar downloadManager={downloadHandler} />
        </div>
      </div>
    )
  }
}

export default App
