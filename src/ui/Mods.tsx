import { invoke } from '@tauri-apps/api'
import React from 'react'
import DownloadHandler from '../utils/download'
import { getModDownload, ModData } from '../utils/gamebanana'
import { getModsFolder } from '../utils/mods'
import { unzip } from '../utils/zipUtils'
import ProgressBar from './components/common/MainProgressBar'
import { ModHeader } from './components/mods/ModHeader'
import { ModList } from './components/mods/ModList'
import TopBar from './components/TopBar'

import './Mods.css'
import Back from '../resources/icons/back.svg'
import Menu from './components/menu/Menu'
import BigButton from './components/common/BigButton'
import Tr from '../utils/language'
import { ModPages } from './components/mods/ModPages'
import TextInput from './components/common/TextInput'

interface IProps {
  downloadHandler: DownloadHandler
}

interface IState {
  isDownloading: boolean
  category: string
  downloadList: { name: string; url: string; mod: ModData }[] | null
  page: number
  search: string
}

const pages = [
  {
    name: -1,
    title: '<',
  },
  {
    name: 1,
    title: '>',
  },
]

const headers = [
  {
    name: 'ripe',
    title: 'Hot',
  },
  {
    name: 'new',
    title: 'New',
  },
  {
    name: 'installed',
    title: 'Installed',
  },
]

/**
 * Mods currently install into folder labelled with their GB ID
 *
 * @TODO Categorizaiton/sorting (by likes, views, etc)
 */
export class Mods extends React.Component<IProps, IState> {
  timeout: number
  constructor(props: IProps) {
    super(props)
    this.timeout = 0

    this.state = {
      isDownloading: false,
      category: '',
      downloadList: null,
      page: 1,
      search: '',
    }

    this.setCategory = this.setCategory.bind(this)
    this.addDownload = this.addDownload.bind(this)
    this.setPage = this.setPage.bind(this)
  }

  async addDownload(mod: ModData) {
    const dlLinks = await getModDownload(String(mod.id))

    // Not gonna bother allowing sorting for now
    const firstLink = dlLinks[0].downloadUrl
    const fileExt = firstLink.split('.').pop()

    const modName = `${mod.id}.${fileExt}`

    if (dlLinks.length === 0) return

    // If there is one download we don't care to choose
    if (dlLinks.length === 1) {
      this.downloadMod(firstLink, modName, mod)
      return
    }

    this.setState({
      downloadList: dlLinks.map((link) => ({
        name: link.filename,
        url: link.downloadUrl,
        mod: mod,
      })),
    })
  }

  async downloadMod(link: string, modName: string, mod: ModData) {
    const modFolder = await getModsFolder()
    const path = `${modFolder}/${modName}`

    if (!modFolder) return

    this.props.downloadHandler.addDownload(link, path, async () => {
      const unzipRes = await unzip(path, modFolder, false, true)

      // Write a modinfo.json file
      invoke('write_file', {
        path: `${unzipRes.new_folder}/modinfo.json`,
        contents: JSON.stringify(mod),
      })
    })
  }

  async setCategory(value: string) {
    this.setState(
      {
        category: value,
      },
      this.forceUpdate
    )
  }

  async setPage(value: number) {
    const current = this.state.page
    if (current + value == 0) return
    this.setState(
      {
        page: current + value,
      },
      this.forceUpdate
    )
  }

  async setSearch(text: string) {
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = window.setTimeout(() => {
      this.setState(
        {
          search: text,
        },
        this.forceUpdate
      )
    }, 300)
  }

  render() {
    return (
      <div className="Mods">
        <TopBar>
          <div
            id="backbtn"
            className="TopButton"
            onClick={() => {
              // Create and dispatch a custom "changePage" event
              const event = new CustomEvent('changePage', { detail: 'main' })
              window.dispatchEvent(event)
            }}
          >
            <img src={Back} alt="back" />
          </div>
        </TopBar>

        {this.state.downloadList && (
          <Menu className="ModMenu" heading="Links" closeFn={() => this.setState({ downloadList: null })}>
            <div className="ModDownloadList">
              {this.state.downloadList.map((o) => {
                return (
                  <div className="ModDownloadItem" key={o.name}>
                    <div className="ModDownloadName">{o.name}</div>
                    <BigButton
                      id={o.url}
                      onClick={() => {
                        const fileExt = o.url.split('.').pop()
                        const modName = `${o.mod.id}.${fileExt}`

                        this.downloadMod(o.url, modName, o.mod)
                        this.setState({
                          downloadList: null,
                        })
                      }}
                    >
                      <Tr text="components.download" />
                    </BigButton>
                  </div>
                )
              })}
            </div>
          </Menu>
        )}

        <div className="TopDownloads">
          <ProgressBar downloadManager={this.props.downloadHandler} withStats={false} />
        </div>

        <ModHeader onChange={this.setCategory} headers={headers} defaultHeader={'ripe'} />

        {this.state.category != 'installed' && (
          <>
            <div className="ModPagesPage">
              <TextInput
                id="search"
                key="search"
                placeholder={'Search Mods - Page ' + this.state.page.toString()}
                onChange={(text: string) => {
                  this.setSearch(text)
                }}
                initalValue={''}
              />
            </div>
            <ModPages onClick={this.setPage} headers={pages} defaultHeader={this.state.page} />
          </>
        )}

        <ModList
          key={`${this.state.category}_${this.state.page}_${this.state.search}`}
          mode={this.state.category}
          addDownload={this.addDownload}
          page={this.state.page}
          search={this.state.search}
        />
      </div>
    )
  }
}
