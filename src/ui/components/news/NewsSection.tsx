/* eslint-disable indent */
import { invoke } from '@tauri-apps/api/tauri'
import Tr from '../../../utils/language'

import './NewsSection.css'
import { batch, createSignal, JSX, onMount } from "solid-js";

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

// TODO: this is such a weird component, needs to be refactored.
export default function NewsSection(props: IProps) {
  const [selected, setSelected] = createSignal(props.selected || 'commits');
  const [news, setNews] = createSignal<JSX.Element>();
  const [commitList, setCommitList] = createSignal<JSX.Element>();

  onMount(showNews);

  function setSelection(item: string) {
    setSelected(item);
    showNews();
  }

  async function showNews() {
    let news: JSX.Element | JSX.Element[] = <tr></tr>

    switch (selected()) {
      case 'commits': {
        const commits = await showLatestCommits()
        if (commits != null) {
          news = commits
        }
        break
      }

      case 'latest_version':
        news = (
          <tr>
            <td>Latest version</td>
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

    setNews(<>{news}</>);
  }

  async function showLatestCommits() {
    if (!commitList()) {
      const response: string = await invoke('req_get', { url: 'https://api.grasscutter.io/cultivation/query' })
      let grasscutterApiResponse: GrasscutterAPIResponse | null = null

      try {
        grasscutterApiResponse = JSON.parse(response)
      } catch (e) {
        grasscutterApiResponse = null
      }

      let commits: CommitResponse[]
      if (grasscutterApiResponse?.commits == null) {
        // If it didn't work, use official API
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
          <tr class="Commit" id="newsCommitsTable">
            <td class="CommitAuthor">
              <span>{commitResponse.commit.author.name}</span>
            </td>
            <td class="CommitMessage">
              <span>{commitResponse.commit.message}</span>
            </td>
          </tr>
        )
      })

      batch(() => {
        setCommitList(commitsListHtml);
        setNews(<>{commitsListHtml}</>);
      });
    }

    return commitList();
  }

  return (
    <div class="NewsSection" id="newsContainer">
      <div class="NewsTabs" id="newsTabsContainer">
        <div
          class={'NewsTab ' + (selected() === 'commits' ? 'selected' : '')}
          id="commits"
          onClick={() => setSelection('commits')}
        >
          <Tr text="news.latest_commits" />
        </div>
        <div
          class={'NewsTab ' + (selected() === 'latest_version' ? 'selected' : '')}
          id="latest_version"
          onClick={() => setSelection('latest_version')}
        >
          <Tr text="news.latest_version" />
        </div>
      </div>
      <table class="NewsContent" id="newsContent">
        <tbody>{news()}</tbody>
      </table>
    </div>
  )
}
