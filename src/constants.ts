import { appDataDir } from "@tauri-apps/api/path";

export const AppDataPath = (await appDataDir()).slice(0, -1);

export const PageRoutes = {
    HOME: "/",
    SETTINGS: "/settings"
};

export const LauncherUrls = {
    GENSHIN_IMPACT: "https://sdk-os-static.mihoyo.com/hk4e_global/mdk/launcher/api/content?filter_adv=false&key=gcStgarh&language=en-us&launcher_id=10",
    STAR_RAIL: "https://hkrpg-launcher-static.hoyoverse.com/hkrpg_global/mdk/launcher/api/content?filter_adv=false&key=vplOVX8Vn7cwG8yb&language=en-us&launcher_id=35"
};
