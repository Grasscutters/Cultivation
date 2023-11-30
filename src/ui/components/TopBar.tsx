import "@css/components/TopBar.scss";

function TopBar() {
    return (
        <div class={"TopBar"} data-tauri-drag-region>
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
