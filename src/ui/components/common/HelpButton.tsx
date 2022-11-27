<<<<<<< HEAD
import { JSX } from 'solid-js';

import Help from '../../../resources/icons/help.svg';
import { translate } from '../../../utils/language';

import './HelpButton.css';

interface IProps {
  children?: JSX.Element;
  contents?: string;
  id?: string;
=======
import './HelpButton.css'
import Help from '../../../resources/icons/help.svg'
import { translate } from '../../../utils/language'
import {JSX} from "solid-js";

interface IProps {
  children?: JSX.Element
  contents?: string
  id?: string
>>>>>>> aa45f04 (feat: move to solid-js)
}

export default function HelpButton(props: IProps) {
  async function showAlert() {
<<<<<<< HEAD
    if (props.contents) alert(await translate(props.contents));
=======
    if (props.contents) alert(await translate(props.contents))
>>>>>>> aa45f04 (feat: move to solid-js)
  }

  return (
    <div class="HelpSection">
      <div class="HelpButton" onClick={showAlert}>
        <img src={Help} />
      </div>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
