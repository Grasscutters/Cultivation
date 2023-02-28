EN | [简中](README_zh-CN.md) | [繁中](README_zh-TW.md) |

# Cultivation : Thorny Edition

A game launcher designed to easily proxy traffic from anime game to private servers.

### Thorny Edition Changes:
 
 - Fixed 3dmigoto paths being broken
 - Fixed "stuck on extracting" issue
 - Better default settings
 - Replace useless stable download with all-in-one download
 - Encryption button actually applies to edited configs
 - Recent commits box shows immediately instead of needing to be clicked on
 - Various QoL improvements
 - Added Korean translation thanks to [@koreako12](https://github.com/koreako12)
 - Some other translation additions (machine translation, let me know if things are wrong)
 
 Since there is no issues page, problems with this edition can be directed to me on discord: Thoronium#7770
  - You will need to join the [Grasscutters discord](https://discord.gg/grasscutter) before being able to send a message request :) or you can ping me in #support
 
# Table Of Contents

- [Client Patching Notice](#client-patching-notice)
- [Download](#download)
- [Setup](#setup)
- [Developer Quick-start](#developer-quickstart)
  - [Setup](#setup)
  - [Building](#building)
  - [Code Formatting and Linting](#code-formatting-and-linting)
  - [Generating Update Artifacts](#generating-update-artifacts)
- [Theming](#theming)
- [Screenshots](#screenshots)
- [Credits](#credits)

# Client Patching Notice - RSA

For game versions 3.1 and above, Cultivation automatically makes a small patch to your game client when launching using Grasscutter, and restores it upon closing the game. In theory, you should still be totally safe, however it would be dishonest to not explicitly state that **modifying the game client could, theoretically, lead to a ban if you connect to official servers with it**. It is extremely unlikely AND there are no instances known of it happening, but the possibility exists.

# Download

[Find release builds here!](https://github.com/Grasscutters/Cultivation/releases)

Download and open the MSI, and once installed, run Cultivation as administrator. Refer below for more [detailed setup instructions](#setup).

**Windows 7 Users:** You will need to download [WebView](https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section) manually, and download the `.zip` instead of the `.msi`.

# Setup

5-minute video for those who don't like to/cannot read: https://youtu.be/e0irOYbQe7I

- Download Cultivation
  - If you are on Windows 10 or 11, use the MSI
  - If you are on Windows 7, or the MSI doesn't work, use the zip and download [WebView](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
  - If you are on Linux or MacOS, [help us port Windows-specific system calls to Linux/MacOS!](https://github.com/Grasscutters/Cultivation/issues/7)
- Install or extract Cultivation
- Open Cultivation **_as administrator_**
- Before clicking randomly on stuff, in options (top right cog icon), set your Game Install Path.
  - If you are using an existing server installation from somewhere else, you can set the `.jar` file in settings as well. All downloads made through Culti will automatically use that path, no additional config needed.
  - If you use multiple Java versions, you can set the Java path to your Java 17 installation (only required if you are running your own server)
- Decide if you want to download your own server, or just join a public one
  - If joining a public one, you're done. Just click "Connect with Grasscutter" and input the address and port. You do not have to continue these instructions.
    - If you are getting System Error, or 4214, ask the [Discord support channels](https://discord.gg/grasscutter)
- Open the "Downloads" menu (top right)
  - Download "latest grasscutter" (second from the top)
  - Download "resources" (very bottom)
- Once all of that is done, click the icon next to "Launch"
- To play on your new server:
  - Click "Connect with Grasscutter"
  - Input `localhost` as the address, and `443` as the port
  - Ensure HTTPS is disabled
- Any generic "I am getting XYZ error!" should go in the [Discord support channels](https://discord.gg/grasscutter)
- Any specific Cultivation issues should go in [the issues section](/issues)
- Any Grasscutter server related issues should go in [the Grasscutter issues section](https://github.com/Grasscutters/Grasscutter)

# Developer Quickstart

### Setup

- Install [NodeJS >12](https://nodejs.org/en/)
- Install [yarn](https://classic.yarnpkg.com/lang/en/docs/install) (cry about it `npm` lovers)
- Install [Rust](https://www.rust-lang.org/tools/install)
- `yarn install`
- `yarn start:dev`

### Building

For a release build,

- `yarn build`

For a debug build,

- `yarn build --debug`

### Code Formatting and Linting

Formatting:

- `yarn format`

Check Lints, fix (some) lints:

- `yarn lint`, `yarn lint:fix`

### Generating Update Artifacts

- Add the `TAURI_PRIVATE_KEY` as an environment variable with a path to your private key.
- Add the `TAURI_KEY_PASSWORD` as an environment variable with the password for your private key.
- `yarn build`

The update will be at `src-tauri/target/(release|debug)/msi/Cultivation_X.X.X_x64_xx-XX.msi.zip`

# Theming

A full theming reference can be found [here!](/THEMES.md)

# Screenshots

![image](https://user-images.githubusercontent.com/107363768/221495236-ca1e2f2e-0f85-4765-a5f3-8bdcea299612.png)
![image](https://user-images.githubusercontent.com/107363768/221495246-ea309640-f866-4f50-bda8-f9d916380f92.png)
![image](https://user-images.githubusercontent.com/107363768/221495249-5a1aac39-9e8a-4244-9642-72c2e7be8a69.png)
![image](https://user-images.githubusercontent.com/107363768/221495254-ffbfc24e-ef5d-4e72-9068-a02132381dcc.png)

## Credits

- [SpikeHD](https://github.com/SpikeHD): For originally creating **GrassClipper** and creating the amazing UI of Cultivation.
- [KingRainbow44](https://github.com/KingRainbow44): For building a proxy daemon from scratch and integrating it with Cultivation.
- [Benj](https://github.com/4Benj): For assistance in client patching.
- [lilmayofuksu](https://github.com/lilmayofuksu): For assistance in client patching.
- [Tauri](https://tauri.app): For providing an amazing, efficient, and simple desktop application framework/library.
