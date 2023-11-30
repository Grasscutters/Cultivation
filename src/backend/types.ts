export type StoreWrite = (partial: unknown, replace?: boolean | undefined) => void;

export type SDKResponse = {
    retcode: number;
    message: string;
};

export type LauncherResponse = SDKResponse & {
    data: {
        adv: BackgroundData; // This is the background shown to the user.
        banner: NewsFeedData[]; // These are shown in a slideshow-style card.
        icon: IconData[]; // These are shown in the right sidebar.
        post: PostData[]; // These are shown in a multi-tab card.
    }
};

export type BackgroundData = {
    background: string; // This is the direct URL to the background image.
    icon: string;
    url: string;
    version: string; // This should be parsed into a number.
    bg_checksum: string; // Unknown hash algorithm.
};

export type NewsFeedData = {
    banner_id: string;
    name: string; // This is almost always blank.
    img: string; // This is a banner-sized image for the card.
    url: string; // This is the associated URL with the card.
                 // It should be opened in the user's browser when clicked on.
    order: string; // This should be parsed into a number.
                   // Shown to the user in the order of lowest -> highest.
};

export type IconData = {
    icon_id: string;
    img: string;
    tittle: string; // Intentionally misspelled.
    url: string;
    qr_img: string;
    qr_desc: string; // This is almost always blank.
    img_hover: string;
    other_links: [];
    title: string;
    icon_link: string;
    links: {
        title: string;
        url: string;
    };
    enable_red_dot: boolean;
    red_dot_content: string;
};

export type PostData = {
    post_id: string;
    type: PostType;
    tittle: string; // Intentionally misspelled.
    url: string; // This is where the user should be directed to.
    show_time: string; // This is a date formatted as mm/dd.
    order: string; // This should be parsed into a number.
                   // Shown to the user in the order of lowest -> highest.
    title: string; // Redundant; same content as 'tittle'.
};

export enum PostType {
    Info = "POST_TYPE_INFO",
    Activity = "POST_TYPE_ACTIVITY",
    Announcement = "POST_TYPE_ANNOUNCE"
}

export enum SupportedGames {
    GenshinImpact = "genshin_impact",
    StarRail = "starrail"
}
