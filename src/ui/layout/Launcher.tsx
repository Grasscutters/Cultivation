import NewsFeed from "@components/NewsFeed.tsx";
import InfoBoard from "@components/InfoBoard.tsx";

import "@css/layout/Launcher.scss";

function Launcher() {
    return (
        <div class={"Launcher"}>
            <div class={"Launcher_Announcements"}>
                <NewsFeed />
                <InfoBoard />
            </div>

            <div>
                <div class={"Launcher_Links"}>

                </div>

                <div class={"Launcher_QuickSettings"}>

                </div>
            </div>
        </div>
    );
}

export default Launcher;
