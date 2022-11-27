import { invoke } from '@tauri-apps/api'
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
import {createSignal, For, Show} from "solid-js";

interface IProps {
  downloadHandler: DownloadHandler
}

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
export function Mods(props: IProps) {
  const [downloading, setDownloading] = createSignal(false);
  const [category, setCategory] = createSignal('');
  const [downloadList, setDownloadList] = createSignal<{ name: string; url: string; mod: ModData }[] | null>(null);

  async function addDownload(mod: ModData) {
    const dlLinks = await getModDownload(String(mod.id))

    // Not gonna bother allowing sorting for now
    const firstLink = dlLinks[0].downloadUrl
    const fileExt = firstLink.split('.').pop()

    const modName = `${mod.id}.${fileExt}`

    if (dlLinks.length === 0) return

    // If there is one download we don't care to choose
    if (dlLinks.length === 1) {
      downloadMod(firstLink, modName, mod)
      return
    }

    setDownloadList(dlLinks.map((link) => ({
      name: link.filename,
      url: link.downloadUrl,
      mod: mod,
    })));
  }

  async function downloadMod(link: string, modName: string, mod: ModData) {
    const modFolder = await getModsFolder()
    const path = `${modFolder}/${modName}`

    if (!modFolder) return

    props.downloadHandler.addDownload(link, path, async () => {
      const unzipRes = await unzip(path, modFolder, false, true)

      // Write a modinfo.json file
      invoke('write_file', {
        path: `${unzipRes.new_folder}/modinfo.json`,
        contents: JSON.stringify(mod),
      })
    })
  }

  return (
    <div class="Mods">
      <TopBar>
        <div
          id="backbtn"
          class="TopButton"
          onClick={() => {
            // Create and dispatch a custom "changePage" event
            const event = new CustomEvent('changePage', { detail: 'main' })
            window.dispatchEvent(event)
          }}
        >
          <img src={Back} alt="back" />
        </div>
      </TopBar>

      <Show when={downloadList()} keyed={false}>
        <Menu class="ModMenu" heading="Links" closeFn={() => setDownloadList(null)}>
          <div class="ModDownloadList">
            <For each={downloadList()}>{(o) => {
              return (
                <div class="ModDownloadItem" >
                  <div class="ModDownloadName">{o.name}</div>
                  <BigButton
                    id={o.url}
                    onClick={() => {
                      const fileExt = o.url.split('.').pop()
                      const modName = `${o.mod.id}.${fileExt}`

                      downloadMod(o.url, modName, o.mod)
                      setDownloadList(null)
                    }}
                  >
                    <Tr text="components.download" />
                  </BigButton>
                </div>
              )
            }}</For>
          </div>
        </Menu>
      </Show>

      <div class="TopDownloads">
        <ProgressBar downloadManager={props.downloadHandler} withStats={false} />
      </div>

      <ModHeader onChange={setCategory} headers={headers} defaultHeader={'ripe'} />

      <ModList mode={category()} addDownload={addDownload} />
    </div>
  )
}
