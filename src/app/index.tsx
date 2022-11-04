import { withProviders } from 'app/providers';
import { useConfigurationManager } from 'entities/configuration';
import { Download } from 'features/download/ui/download';
import { createEffect, Show, Suspense } from 'solid-js';
import { DownloadsMenu } from "widgets/menu/downloads-menu";

export const App = withProviders(function AppInner() {
  const { getConfigOption } = useConfigurationManager();
  const isDebug = () => getConfigOption('debug_enabled');

  createEffect(async () => {
    if (isDebug()) {
      const { reportWebVitals } = await import('utils/reportWebVitals');
      reportWebVitals(console.log);
    }
  });

  return (
    // Add proper loading
    <Suspense fallback={null}>
      <Show
        when={isDebug()}
        keyed={false}
        fallback={<DownloadsMenu closeFn={() => {}} />}>

        Debug
      </Show>
    </Suspense>
  );
});
