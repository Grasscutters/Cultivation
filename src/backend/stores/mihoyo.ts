import { useEffect, useState } from "preact/hooks";

import useSettings from "@backend/stores/settings.ts";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { invoke } from "@tauri-apps/api";
import { fetch } from "@tauri-apps/api/http";
import { exists } from "@tauri-apps/api/fs";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import { LauncherResponse, StoreWrite, SupportedGames } from "@backend/types.ts";
import { AppDataPath, LauncherUrls } from "@app/constants.ts";

export type GameDataStore = {
    backgroundHash: string;

    fetchLatestBackground: () => Promise<void>;
};

export const useGenshinStore = create<GameDataStore>()(
    persist(
        (set): GameDataStore => ({
            backgroundHash: "",
            fetchLatestBackground: () => fetchLatestBackground(
                set as StoreWrite, LauncherUrls.GENSHIN_IMPACT)
        }),
        {
            name: "genshin_data",
            storage: createJSONStorage(() => localStorage)
        }
    )
);

export const useStarRailStore = create<GameDataStore>()(
    persist(
        (set) => ({
            backgroundHash: "",
            fetchLatestBackground: () => fetchLatestBackground(
                set as StoreWrite, LauncherUrls.STAR_RAIL)
        }),
        {
            name: "starrail_data",
            storage: createJSONStorage(() => localStorage)
        }
    )
);

/**
 * Fetches the latest background image.
 *
 * @param set The store write function.
 * @param serviceUrl The URL used for fetching the background.
 */
export async function fetchLatestBackground(set: StoreWrite, serviceUrl: string): Promise<void> {
    // Fetch the launcher data.
    const launcherData = await fetch<LauncherResponse>(serviceUrl);
    const responseData = launcherData.data;

    // Check if the background exists on the system.
    const backgroundUrl = responseData.data.adv.background;
    const backgroundHash = backgroundUrl.split("/").pop()?.substring(0, 32);
    if (backgroundHash == undefined) throw new Error("Unable to find the hash of the background.");

    // Check if the file exists on the system.
    const filePath = `${AppDataPath}/bg/${backgroundHash}.png`;
    if (!await exists(filePath)) {
        // Download the image.
        await invoke("download_file", {
            url: backgroundUrl, toFile: filePath
        });

        // Update the store.
        set({ backgroundHash });
    }
}

/**
 * Attempts to get the file of the background.
 *
 * @param hash The hash of the background.
 */
export async function getBackgroundFile(hash: string): Promise<string> {
    return convertFileSrc(`${AppDataPath}/bg/${hash}.png`);
}

/**
 * React hook which returns the URL of the locally cached background image.
 */
export function useBackground() {
    const { selectedGame } = useSettings();
    const { backgroundHash, fetchLatestBackground } =
        selectedGame == SupportedGames.GenshinImpact ? useGenshinStore() : useStarRailStore();
    const [background, setBackground] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (backgroundHash != "") {
                setBackground(await getBackgroundFile(backgroundHash));
            } else {
                fetchLatestBackground();
            }
        })();
    }, [backgroundHash, fetchLatestBackground]);

    return background;
}
