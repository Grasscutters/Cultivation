[EN](README.md) | 简中 | [繁中](README_zh-TW.md)

# Cultivation

一个游戏启动器，旨在轻松将某动漫游戏的流量代理到私人服务器。

虽然此存储库是**开放的**。 但这**并不**意味着它已经发布。
请不要**安装、下载或使用在其他地方找到的预编译版本的 Cultivation**。 仅使用此 GitHub 存储库中的版本。

# 目录

- [下载](#下载)
- [开发人员快速入门](#开发人员快速入门)
  - [安装](#安装)
  - [编译](#编译)
  - [代码格式化与纠错](#代码格式化与纠错)
  - [生成更新项目](#生成更新项目)
- [启动器主题](#启动器主题)
- [画面](#画面)
- [成员](#成员)

# 客户端修补通知

对于游戏版本为 3.1 及以上时，使用 Grasscutter 启动时，Cultivation 会自动为您的游戏客户端制作一个小补丁，并在关闭游戏时恢复它。 从理论上讲，你应该是完全安全的，但是不明确**如果您使用它连接到官方服务器，修改游戏客户端可能会导致封号**，但可能性是非常小的，并且从未接到发生过此类情况的问题，但存在这种可能性！

# 下载

[在此处查找发布版本！](https://github.com/Grasscutters/Cultivation/releases)

下载后，从某个位置解压缩并以管理员身份打开。

# 开发人员快速入门

### 安装

- 安装 [NodeJS >12](https://nodejs.org/en/)
- 安装 [yarn](https://classic.yarnpkg.com/lang/en/docs/install)
- 安装 [Rust](https://www.rust-lang.org/tools/install)
- `yarn install`
- `yarn start:dev`

### 编译

发布版本，

- `yarn build`

调试版本，

- `yarn build --debug`

### 代码格式化与纠错

格式化:

- `yarn format`

纠错, 修复（一些）错误:

- `yarn lint`, `yarn lint:fix`

### 生成更新项目

- 将 `TAURI_PRIVATE_KEY` 添加到环境变量，其中包含私钥的路径。
- 将 `TAURI_KEY_PASSWORD` 添加到环境变量，其中包含私钥的密码。
- `yarn build`

更新将生成在 `src-tauri/target/(release|debug)/msi/Cultivation_X.X.X_x64_xx-XX.msi.zip`

# 启动器主题

完整的主题参考可以[在这里找到!](/THEMES.md)

# 画面

![image](https://user-images.githubusercontent.com/107363768/221495236-ca1e2f2e-0f85-4765-a5f3-8bdcea299612.png)
![image](https://user-images.githubusercontent.com/107363768/221495246-ea309640-f866-4f50-bda8-f9d916380f92.png)
![image](https://user-images.githubusercontent.com/107363768/221495249-5a1aac39-9e8a-4244-9642-72c2e7be8a69.png)
![image](https://user-images.githubusercontent.com/107363768/221495254-ffbfc24e-ef5d-4e72-9068-a02132381dcc.png)

## 成员

- [SpikeHD](https://github.com/SpikeHD): For originally creating **GrassClipper** and creating the amazing UI of Cultivation.
- [KingRainbow44](https://github.com/KingRainbow44): For building a proxy daemon from scratch and integrating it with Cultivation.
- [Benj](https://github.com/4Benj): For assistance in client patching.
- [lilmayofuksu](https://github.com/lilmayofuksu): For assistance in client patching.
- [Tauri](https://tauri.app): For providing an amazing, efficient, and simple desktop application framework/library.
