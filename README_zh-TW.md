[EN](README.md) | [简中](README_zh-CN.md) | 繁中

# 客戶端修補通知

對於遊戲版本為 3.1 及以上時，使用 Grasscutter 啟動時，Cultivation 會自動為您的遊戲客戶端製作一個小修補，並在關閉遊戲時恢復它。 從理論上講，你應該是完全安全的，但是不明確**如果您使用它連接到官方伺服器，修改遊戲客戶端可能會導致封號**，但可能性是非常小的，並且從未接到發生過此類情況的問題，但存在這種可能性！

# Cultivation

一個遊戲啟動器，旨在輕松將某動漫遊戲的流量代理到私人伺服器。

雖然此存儲庫是**開放的**。 但這**並不**意味著它已經發布。
請不要**安裝、下載或使用在其他地方找到的預編譯版本的 Cultivation**。 僅使用此 GitHub 存儲庫中的版本。

# 目錄

- [下載](#下載)
- [開發人員快速入門](#開發人員快速入門)
  - [安裝](#安裝)
  - [編譯](#編譯)
  - [代碼格式化與糾錯](#代碼格式化與糾錯)
  - [生成更新項目](#生成更新項目)
- [啟動器主題](#啟動器主題)
- [畫面](#畫面)
- [成員](#成員)

# 下載

[在此處查找發布版本！](https://github.com/Grasscutters/Cultivation/releases)

下載後，從某個位置解壓縮並以管理員身份打開。

# 開發人員快速入門

### 安裝

- 安裝 [NodeJS >12](https://nodejs.org/en/)
- 安裝 [yarn](https://classic.yarnpkg.com/lang/en/docs/install) (`npm`愛好者去哭吧！（滑稽）)
- 安裝 [Rust](https://www.rust-lang.org/tools/install)
- `yarn install`
- `yarn start:dev`

### 編譯

發布版本，

- `yarn build`

調試版本，

- `yarn build --debug`

### 代碼格式化與糾錯

格式化:

- `yarn format`

糾錯, 修復（一些）錯誤:

- `yarn lint`, `yarn lint:fix`

### 生成更新項目

- 將 `TAURI_PRIVATE_KEY` 添加到環境變數，其中包含私鑰的路徑。
- 將 `TAURI_KEY_PASSWORD` 添加到環境變數，其中包含私鑰的密碼。
- `yarn build`

更新將生成在 `src-tauri/target/(release|debug)/msi/Cultivation_X.X.X_x64_xx-XX.msi.zip`

# 啟動器主題

完整的主題參考可以[在這裏找到!](/THEMES.md)

# 畫面

![image](https://user-images.githubusercontent.com/107363768/221495236-ca1e2f2e-0f85-4765-a5f3-8bdcea299612.png)
![image](https://user-images.githubusercontent.com/107363768/221495246-ea309640-f866-4f50-bda8-f9d916380f92.png)
![image](https://user-images.githubusercontent.com/107363768/221495249-5a1aac39-9e8a-4244-9642-72c2e7be8a69.png)
![image](https://user-images.githubusercontent.com/107363768/221495254-ffbfc24e-ef5d-4e72-9068-a02132381dcc.png)

## 成員

- [SpikeHD](https://github.com/SpikeHD): For originally creating **GrassClipper** and creating the amazing UI of Cultivation.
- [KingRainbow44](https://github.com/KingRainbow44): For building a proxy daemon from scratch and integrating it with Cultivation.
- [Benj](https://github.com/4Benj): For assistance in client patching.
- [lilmayofuksu](https://github.com/lilmayofuksu): For assistance in client patching.
- [Tauri](https://tauri.app): For providing an amazing, efficient, and simple desktop application framework/library.
