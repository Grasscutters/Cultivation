# Cient Patching Notice
For game versions 2.8 and above, Cultivation automatically makes a small patch to your game client when launching using Grasscutter, and restores it upon closing the game. In theory, you should still be totally safe, however it would be dishonest to not explicitly state that **modifying the game client could, theoretically, lead to a ban if you connect to official servers with it**. It is extremely unlikely AND there are no instances known of it happening, but the possibility exists.

# Cultivation
A game launcher designed to easily proxy traffic from anime game to private servers.

While the Cultivation repository is **open**. This does **not** mean it has released.
Please do **NOT install, download, or use pre-compiled versions of Cultivation found elsewhere**. Only use releases from this GitHub repository.

# Table Of Contents
* [Download](#download)
* [Developer Quick-start](#developer-quickstart)
  * [Setup](#setup)
  * [Building](#building)
* [Troubleshooting](#troubleshooting)
* [Theming](#theming)

# Download
[Find release builds here!](https://github.com/Grasscutters/Cultivation/releases)

Once downloaded, extract somewhere and open as administrator.

# Developer Quickstart

### Setup
* Install [NodeJS >12](https://nodejs.org/en/)
* Install [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable) (cry about it `npm` lovers)
* Install [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) & [Rust compiler](https://www.rust-lang.org/tools/install)
* `yarn install`
* `yarn start:dev`

### Building
`npm run build` or `yarn build`

Add `--release` or `--debug` depending on what release you are creating. This defaults to `--release`

### Code Formatting and Linting

Format the code with `npm format` or `yarn format`. Run the lints with `npm lint` or `yarn lint`.

### Updating
* Add the `TAURI_PRIVATE_KEY` as an environment variable with a path to your private key.
* Add the `TAURI_KEY_PASSWORD` as an environment variable with the password for your private key.
* Run `npm run update` or `yarn build`
* The update will be in `src-tauri/target/(release|debug)/msi/Cultivation_X.X.X_x64_xx-XX.msi.zip`

# Troubleshooting
TODO. Collect common issues before updating.

# Theming

A full theming reference can be found [here!](/THEMES.md)

# Screenshots
![image](https://user-images.githubusercontent.com/25207995/173211603-e5e85df7-7fd3-430b-9246-749ebbc1e483.png)
![image](https://user-images.githubusercontent.com/25207995/173211543-b7e88943-cfd2-418b-ac48-7f856868129b.png)
![image](https://user-images.githubusercontent.com/25207995/173211561-a1778fdc-5cfe-4687-9a00-44500d29e470.png)
![image](https://user-images.githubusercontent.com/25207995/173211573-8cedfa9a-51c9-4670-a4f7-a334a2fabec5.png)
![image](https://user-images.githubusercontent.com/25207995/173211590-6a2242b5-1e8f-4db9-a5c7-06284688b131.png)

## Credits
* [SpikeHD](https://github.com/SpikeHD): For originally creating **GrassClipper** and creating the amazing UI of Cultivation.
* [KingRainbow44](https://github.com/KingRainbow44): For building a proxy daemon from scratch and integrating it with Cultivation.
* [Tauri](https://tauri.app): For providing an amazing, efficient, and simple desktop application framework/library.
