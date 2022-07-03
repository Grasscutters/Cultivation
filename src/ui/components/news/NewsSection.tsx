/* eslint-disable indent */
import { invoke } from '@tauri-apps/api/tauri'
import React from 'react'
import Tr from '../../../utils/language'

import './NewsSection.css'

interface IProps {
  selected?: string;
}

interface IState {
  selected: string;
  news: any;
  commitList: any;
}

export default class NewsSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      selected: props.selected || 'commits',
      news: null,
      commitList: null
    }

    this.setSelected = this.setSelected.bind(this)
    this.showNews = this.showNews.bind(this)
  }

  componentDidMount() {
    // Call showNews off the bat
    this.showNews()
  }

  setSelected(item: string) {
    this.setState({ selected: item }, () => {
      this.showNews()
    })
  }

  async showLatestCommits() {
    if (!this.state.commitList) {
      const commits: string = await invoke('req_get', { url: 'https://api.grasscutter.io/cultivation/query' })
      let obj

      try {
        obj = JSON.parse(commits)
      } catch(e) {
        obj = {}
      }

      // If it didn't work, use official API
      if (!obj.commits) {
        const commits: string = await invoke('req_get', { url: 'https://api.github.com/repos/Grasscutters/Grasscutter/commits' })
        obj = JSON.parse(commits)
      } else {
        const decoded: string = await invoke('base64_decode', { encoded: obj.commits })
        const commitData = JSON.parse(decoded)
        obj = commitData.gc_stable
      }

      // Probably rate-limited
      if (!Array.isArray(obj)) return
  
      // Get only first 5
      const commitsList = obj.slice(0, 10)
      const commitsListHtml = commitsList.map((commit: any) => {
        return (
          <tr className="Commit" id="newsCommitsTable" key={commit.sha}>
            <td className="CommitAuthor" id="newsCommitsAuthor"><span>{commit.commit.author.name}</span></td>
            <td className="CommitMessage" id="newsCommitsCommitMessage"><span>{commit.commit.message}</span></td>
          </tr>
        )
      })

      this.setState({
        commitList: commitsListHtml,
        news: commitsListHtml
      })
    }

    return this.state.commitList
  }

  async showNews() {
    let news = <tr></tr>

    switch(this.state.selected) {
      case 'commits':
        news = await this.showLatestCommits()
        break

      case 'latest_version':
        news = <tr><td>Latest version</td></tr>
        break

      default:
        news = <tr><td>Unknown</td></tr>
        break
    }

    this.setState({
      news
    })
  }

  render() {
    return (
      <div className="NewsSection" id="newsContainer">
        <div className="NewsTabs" id="newsTabsContainer">
          <div className={'NewsTab ' + (this.state.selected === 'commits' ? 'selected' : '')} id="commits" onClick={() => this.setSelected('commits')}>
            <Tr text="news.latest_commits" />
          </div>
          <div className={'NewsTab ' + (this.state.selected === 'latest_version' ? 'selected' : '')} id="latest_version" onClick={() => this.setSelected('latest_version')}>
            <Tr text="news.latest_version" />
          </div>
        </div>
        <table className="NewsContent" id="newsContent">
            <tbody>
                {this.state.news}
            </tbody>
        </table>
      </div>
    )
  }
}