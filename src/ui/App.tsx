import { Route, Routes } from "react-router-dom";

import TopBar from "@components/TopBar.tsx";
import Launcher from "@ui/layout/Launcher.tsx";

import { PageRoutes } from "@app/constants.ts";

import "@css/App.scss";

function App() {
    return (
        <div class={"App"}>
            <TopBar />

            <Routes>
                <Route path={PageRoutes.HOME} element={<Launcher />} />
            </Routes>
        </div>
    );
}

export default App;
