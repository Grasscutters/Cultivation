import "@css/components/TopBar.scss";

interface IProps {
    color: string | null;
}

function TopBar(props: IProps) {
    return (
        <div class={"TopBar"} data-tauri-drag-region
             style={{ backgroundColor: `${props.color}55` }}
        >
            <div class={"flex flex-row gap-1 text-white"}>
                <p>Cultivation</p>
                <p>2.0.0</p>
            </div>

            <div>

            </div>
        </div>
    );
}

export default TopBar;
