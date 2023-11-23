import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { invoke } from "@tauri-apps/api";

export type GenshinStore = {
    backgroundHash: string;
};

export const useGenshinStore = create(
    persist(
        (): GenshinStore => ({
            backgroundHash: ""
        }),
        {
            name: "genshin",
            storage: createJSONStorage(() => localStorage)
        }
    )
);

/**
 * React hook which returns the URL of the locally cached background image.
 */
export function useBackground() {
    const { backgroundHash } = useGenshinStore();
    const [background, setBackground] = useState<string | null>(null);
}
