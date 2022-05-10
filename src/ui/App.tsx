import React from 'react'
import './App.css'
import './custom.css'

/* FOR TESTING */
import DownloadHandler from '../utils/download'

// Major Components
import TopBar from './components/TopBar'
import ServerLaunchSection from './components/ServerLaunchSection'
import ProgressBar from './components/common/ProgressBar'
import MainProgressBar from './components/common/MainProgressBar'
import Options from './components/menu/Options'

interface IProps {
  [key: string]: never;
}

interface IState {
  isDownloading: boolean;
  optionsOpen: boolean;
}

const downloadHandler = new DownloadHandler()

async function download(url: string, filename: string, path: string) {
  const completePath = `${path}/${filename}`
  downloadHandler.addDownload(url, completePath)
}

async function TESTDOWNLOAD() {
  download(
    'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/stable.zip',
    'grasscutter.zip',
    'S:/Cultivation'
  )
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      isDownloading: false,
      optionsOpen: false
    }
  }

  render() {
    return (
      <div className="App">
        <TopBar
          optFunc={() => {
            this.setState({ optionsOpen: !this.state.optionsOpen })
          }}
          downFunc={() => null}
        />

        {
          this.state.optionsOpen ? <Options /> : null
        }

        <button onClick={TESTDOWNLOAD}>download file test</button>

        <ServerLaunchSection />

        <div id="DownloadProgress">
          <MainProgressBar downloadManager={downloadHandler} />
        </div>
      </div>
    )
  }
}

export default App
