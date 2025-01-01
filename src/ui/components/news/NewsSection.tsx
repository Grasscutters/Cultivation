/* eslint-disable indent */
import { invoke } from '@tauri-apps/api/tauri'
import React from 'react'
import Tr from '../../../utils/language'
import { getConfig, getConfigOption } from '../../../utils/configuration'

import './NewsSection.css'

interface IProps {
  selected?: string
}

interface IState {
  offline: boolean
  selected: string
  news?: JSX.Element
  commitList?: JSX.Element[]
}

interface GrasscutterAPIResponse {
  commits: {
    gc_stable: CommitResponse[]
    gc_dev: CommitResponse[]
    cultivation: CommitResponse[]
  }
}

interface CommitResponse {
  sha: string
  commit: Commit
}

interface Commit {
  author: {
    name: string
  }
  message: string
}

export default class NewsSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      offline: false,
      selected: props.selected || 'commits',
    }

    this.setSelected = this.setSelected.bind(this)
    this.showNews = this.showNews.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()
    this.setState({
      offline: config.offline_mode || false,
    })

    // If offline, don't call news
    if (this.state.offline) {
      return
    }
    // Call showNews off the bat
    this.showNews()
    this.setSelected('commits')
  }

  setSelected(item: string) {
    this.setState({ selected: item }, () => {
      this.showNews()
    })
  }

  async showLatestCommits() {
    // Just use official API
    const response: string = await invoke('req_get', {
      url: 'https://api.github.com/repos/Grasscutters/Grasscutter/commits',
    })
    let grasscutterApiResponse: GrasscutterAPIResponse | null = null

    try {
      grasscutterApiResponse = JSON.parse(response)
    } catch (e) {
      grasscutterApiResponse = null
    }

    let commits: CommitResponse[]
    if (grasscutterApiResponse?.commits == null) {
      // If it didn't work, try again anyways
      const response: string = await invoke('req_get', {
        url: 'https://api.github.com/repos/Grasscutters/Grasscutter/commits',
      })
      commits = JSON.parse(response)
    } else {
      commits = grasscutterApiResponse.commits.gc_stable
    }

    // Probably rate-limited
    if (!Array.isArray(commits)) return

    // Get only first 5
    const commitsList = commits.slice(0, 10)
    const commitsListHtml = commitsList.map((commitResponse: CommitResponse) => {
      return (
        <tr className="Commit" id="newsCommitsTable" key={commitResponse.sha}>
          <td className="CommitAuthor">
            <span>{commitResponse.commit.author.name}</span>
          </td>
          <td className="CommitMessage">
            <span>{commitResponse.commit.message}</span>
          </td>
        </tr>
      )
    })

    this.setState({
      commitList: commitsListHtml,
      news: <>{commitsListHtml}</>,
    })

    return this.state.commitList
  }

  async showNews() {
    const offline_mode = await getConfigOption('offline_mode')
    if (offline_mode) {
      return
    }

    let news: JSX.Element | JSX.Element[] = <tr></tr>

    switch (this.state.selected) {
      case 'commits': {
        const commits = await this.showLatestCommits()
        if (commits != null) {
          news = commits
        }
        break
      }

      case 'latest_version':
        news = (
          <tr>
            <td>
              Work in progress area! These numbers may be outdated, so please do not use them as reference. Latest
              version: Grasscutter 1.7.4 - Cultivation 1.5.3
            </td>
          </tr>
        )
        break

      default:
        news = (
          <tr>
            <td>Unknown</td>
          </tr>
        )
        break
    }

    this.setState({
      news: <>{news}</>,
    })
  }

  render() {
    if (this.state.offline) {
      return null
    }

    return (
      <div className="NewsSection" id="newsContainer">
        <div className="NewsTabs" id="newsTabsContainer">
          <div
            className={'NewsTab ' + (this.state.selected === 'commits' ? 'selected' : '')}
            id="commits"
            onClick={() => this.setSelected('commits')}
          >
            <Tr text="news.latest_commits" />
          </div>
          <div
            className={'NewsTab ' + (this.state.selected === 'latest_version' ? 'selected' : '')}
            id="latest_version"
            onClick={() => this.setSelected('latest_version')}
          >
            <Tr text="news.latest_version" />
          </div>
        </div>
        <table className="NewsContent" id="newsContent">
          <tbody>{this.state.news}</tbody>
        </table>
      </div>
    )
  }
}
