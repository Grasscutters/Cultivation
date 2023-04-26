/* eslint-disable indent */
import { invoke } from '@tauri-apps/api/tauri'
import React from 'react'
import Tr from '../../../utils/language'

import './NewsSection.css'

interface IProps {
  selected?: string
}

interface IState {
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
      selected: props.selected || 'commits',
    }

    this.setSelected = this.setSelected.bind(this)
    this.showNews = this.showNews.bind(this)
  }

  componentDidMount() {
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
            <td>Latest version: Grasscutter 1.4.8 - Cultivation 1.0.27</td>
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
