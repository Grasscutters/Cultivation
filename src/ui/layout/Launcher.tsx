import NewsFeed from "@components/NewsFeed.tsx";
import InfoBoard from "@components/InfoBoard.tsx";
import { Button } from "@fluentui/react-components";

function Launcher() {
    return (
        <div className={"App_Body"}>
            <div>
                <NewsFeed />
                <InfoBoard />

                <Button>

                </Button>
            </div>

            <div>

            </div>
        </div>
    );
}

export default Launcher;
