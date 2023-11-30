import { Route, Router } from "preact-router";

import TopBar from "@components/TopBar.tsx";
import Launcher from "@ui/layout/Launcher.tsx";

import { PageRoutes } from "@app/constants.ts";

import "@css/App.scss";

function App() {
    return (
        <div className={"App"}>
            <TopBar />

            <Router>
                <Route path={PageRoutes.HOME} component={Launcher} />
            </Router>
        </div>
    );
}

export default App;
