import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { SupportedGames } from "@backend/types.ts";

export type SettingsStore = {
    selectedGame: SupportedGames | any;

    setGame: (game: SupportedGames) => void;
};

const useSettings = create<SettingsStore>()(
    persist(
        (set) => ({
            selectedGame: SupportedGames.GenshinImpact,

            setGame: (selectedGame) => set({ selectedGame })
        }),
        {
            name: "settings",
            storage: createJSONStorage(() => localStorage)
        }
    )
);

export default useSettings;
