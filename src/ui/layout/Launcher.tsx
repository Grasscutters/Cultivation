import NewsFeed from "@components/NewsFeed.tsx";
import InfoBoard from "@components/InfoBoard.tsx";

interface Props {}

function Launcher(_props: Props) {
    return (
        <div className={"App_Body"}>
            <div>
                <NewsFeed />
                <InfoBoard />
            </div>

            <div>

            </div>
        </div>
    );
}

export default Launcher;
