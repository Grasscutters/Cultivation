import NewsFeed from "@components/NewsFeed.tsx";
import InfoBoard from "@components/InfoBoard.tsx";

function Launcher() {
    return (
        <div class={"Launcher_Announcements"}>
            <div>
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
