import Router, { Route } from "preact-router";


import TopBar from "@components/TopBar.tsx";
import Launcher from "@ui/layout/Launcher.tsx";

import { useBackground } from "@backend/stores/mihoyo.ts";

import { PageRoutes } from "@app/constants.ts";

import "@css/App.scss";

function App() {
    const background = useBackground();

    return (
        <div class={"App"}
             style={{
                 backgroundImage: `url(${background.url})`
             }}
        >
            <TopBar color={background.colors[2]} />

            <Router>
                <Route path={PageRoutes.HOME} component={Launcher} />
            </Router>
        </div>
    );
}

export default App;
