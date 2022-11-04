import { Download } from 'features/download';
import { Divider } from 'shared/ui/atoms';
import { Layout } from 'shared/ui/layouts';

import * as styles from './style.css';

type DownloadsMenuProps = {
  closeFn: () => void | Promise<void>;
};

export function DownloadsMenu(props: DownloadsMenuProps) {
  return (
    <Layout.Menu
      closeFn={props.closeFn}
      class={styles.downloads}
      heading="Downloads">
      <Download download="jar" type="stable" />
      <Download download="jar" type="latest" />

      <Divider />

      <Download download="repo" type="stable" />
      <Download download="repo" type="dev" />

      <Divider />

      <Download download="resources" />
    </Layout.Menu>
  );
}
