import { JSX } from 'solid-js';

import Help from '../../../resources/icons/help.svg';
import { translate } from '../../../utils/language';

import './HelpButton.css';

interface IProps {
  children?: JSX.Element;
  contents?: string;
  id?: string;
}

export default function HelpButton(props: IProps) {
  async function showAlert() {
    if (props.contents) alert(await translate(props.contents));
  }

  return (
    <div class="HelpSection">
      <div class="HelpButton" onClick={showAlert}>
        <img src={Help} />
      </div>
    </div>
  );
}
