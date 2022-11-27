<<<<<<< HEAD
import { createSignal, onMount, Show } from 'solid-js';
import { shell } from '@tauri-apps/api';

import Download from '../../../resources/icons/download.svg';
import Eye from '../../../resources/icons/eye.svg';
import Folder from '../../../resources/icons/folder.svg';
import Like from '../../../resources/icons/like.svg';
import { ModData, PartialModData } from '../../../utils/gamebanana';
import { disableMod, enableMod, modIsEnabled } from '../../../utils/mods';
import Checkbox from '../common/Checkbox';

import './ModTile.css';
=======
import { ModData, PartialModData } from '../../../utils/gamebanana'

import './ModTile.css'
import Like from '../../../resources/icons/like.svg'
import Eye from '../../../resources/icons/eye.svg'
import Download from '../../../resources/icons/download.svg'
import Folder from '../../../resources/icons/folder.svg'
import { shell } from '@tauri-apps/api'
import Checkbox from '../common/Checkbox'
import { disableMod, enableMod, modIsEnabled } from '../../../utils/mods'
import {createSignal, onMount, Show} from "solid-js";
>>>>>>> aa45f04 (feat: move to solid-js)

interface IProps {
  mod: ModData | PartialModData;
  horny?: boolean;
  path?: string;
  onClick: (mod: ModData) => void;
}

export function ModTile(props: IProps) {
  const [hover, setHover] = createSignal(false);
  const [modEnabled, setModEnabled] = createSignal(false);

<<<<<<< HEAD
  function getModFolderName() {
    if (!('id' in props.mod)) {
      return props.mod.name.includes('DISABLED_')
        ? props.mod.name.split('DISABLED_')[1]
        : props.mod.name;
    }

    return String(props.mod.id);
=======
export function ModTile(props: IProps) {
  const [hover, setHover] = createSignal(false);
  const [modEnabled, setModEnabled] = createSignal(false);

  function getModFolderName() {
    if (!('id' in props.mod)) {
      return props.mod.name.includes('DISABLED_') ? props.mod.name.split('DISABLED_')[1] : props.mod.name
    }

    return String(props.mod.id)
>>>>>>> aa45f04 (feat: move to solid-js)
  }

  onMount(async () => {
    if (!('id' in props.mod)) {
      // Partial mod
      setModEnabled(await modIsEnabled(props.mod.name));

      return;
    }

    setModEnabled(await modIsEnabled(String(props.mod.id)));
  });

  function openInExplorer() {
<<<<<<< HEAD
    if (props.path) shell.open(props.path);
=======
    if (props.path) shell.open(props.path)
>>>>>>> aa45f04 (feat: move to solid-js)
  }

  function toggleMod() {
    setModEnabled((e) => !e);
    const folderName = String(getModFolderName());
    modEnabled() ? enableMod(folderName) : disableMod(folderName);
  }

  return (
    <div
      class="ModListItem"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
<<<<<<< HEAD
      onClick={() => {
        if (props.path) return;
        if (!('id' in props.mod)) return;

        props.onClick(props.mod);
      }}>
      <span class="ModName">
        {props.mod.name.includes('DISABLED_')
          ? props.mod.name.split('DISABLED_')[1]
          : props.mod.name}
      </span>
      <span class="ModAuthor">{props.mod.submitter.name}</span>
      <div class="ModImage">
        <Show when={hover()} keyed={false}>
          <Show
            when={!props.path}
            keyed={false}
            fallback={
              <div class="ModTileOpen">
                <img
                  src={Folder}
                  class="ModTileFolder"
                  alt="Open"
                  onClick={openInExplorer}
                />
                <Checkbox
                  checked={modEnabled()}
                  id={props.mod.name}
                  onChange={toggleMod}
                />
              </div>
            }>
=======
      onClick={!props.path ? (() => {
        if (!('id' in props.mod)) return;

        props.onClick(props.mod)
      }) : undefined}
    >
      <span class="ModName">{props.mod.name.includes('DISABLED_') ? props.mod.name.split('DISABLED_')[1] : props.mod.name}</span>
      <span class="ModAuthor">{props.mod.submitter.name}</span>
      <div class="ModImage">
        <Show when={hover()} keyed={false}>
          <Show when={!props.path} keyed={false} fallback={(
            <div class="ModTileOpen">
              <img src={Folder} class="ModTileFolder" alt="Open" onClick={openInExplorer} />
              <Checkbox checked={modEnabled()} id={props.mod.name} onChange={toggleMod} />
            </div>
          )}>
>>>>>>> aa45f04 (feat: move to solid-js)
            <img src={Download} class="ModTileDownload" alt="Download" />
          </Show>
        </Show>
        <img
          src={props.mod.images[0]}
<<<<<<< HEAD
          class={`ModImageInner ${
            'id' in props.mod && !props.horny && props.mod.nsfw ? 'nsfw' : ''
          } ${hover() ? 'blur' : ''}`}
=======
          class={`ModImageInner ${'id' in props.mod && !props.horny && props.mod.nsfw ? 'nsfw' : ''} ${
            hover() ? 'blur' : ''
          }`}
>>>>>>> aa45f04 (feat: move to solid-js)
        />
      </div>
      <div class="ModInner">
        <div class="likes">
          <img src={Like} />
          <span>{props.mod.likes.toLocaleString()}</span>
        </div>
        <div class="views">
          <img src={Eye} />
          <span>{props.mod.views.toLocaleString()}</span>
        </div>
      </div>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
