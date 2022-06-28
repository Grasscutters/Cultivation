# Cultivation
A custom launcher designed to easily proxy traffic from anime game to private servers.

# Table Of Contents

* [Download](#download)
* [Developer Quickstart](#developer-quickstart)
  * [Setup](#setup)
  * [Building](#building)
* [Troubleshooting](#troubleshooting)

# Download

[Download the latest release here!](https://github.com/Grasscutters/Cultivation/releases)

Once downloaded, extract somewhere and open as administrator. TODO

# Developer Quickstart

### Setup

* Install [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) & [Rust compiler](https://www.rust-lang.org/tools/install)
* `npm install` or `yarn install`
* `npm run start:dev` or `yarn start:dev`

### Building

`npm run build` or `yarn build`

Add `--release` or `--debug` depending on what release you are creating. This defaults to `--release`

### Updating

* Add the `TAURI_PRIVATE_KEY` as an environment variable with a path to your private key.
* Add the `TAURI_KEY_PASSWORD` as an environment variable with the password for your private key.
* Run `npm run update` or `yarn build`
* The update will be in `src-tauri/target/(release|debug)/msi/Cultivation_X.X.X_x64_xx-XX.msi.zip`

# Troubleshooting

Idk figure it out (TODO)

# Screenshots

![image](https://user-images.githubusercontent.com/25207995/173211603-e5e85df7-7fd3-430b-9246-749ebbc1e483.png)
![image](https://user-images.githubusercontent.com/25207995/173211543-b7e88943-cfd2-418b-ac48-7f856868129b.png)
![image](https://user-images.githubusercontent.com/25207995/173211561-a1778fdc-5cfe-4687-9a00-44500d29e470.png)
![image](https://user-images.githubusercontent.com/25207995/173211573-8cedfa9a-51c9-4670-a4f7-a334a2fabec5.png)
![image](https://user-images.githubusercontent.com/25207995/173211590-6a2242b5-1e8f-4db9-a5c7-06284688b131.png)




