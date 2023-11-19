[EN](README.md) | [简中](README_zh-CN.md) | [繁中](README_zh-TW.md) | 日本語

# Cultivation

某アニメゲームからプライベートサーバーへのトラフィックを簡単にプロキシできるように設計されたゲームランチャー。

# 目次

- [クライアントのパッチに関するお知らせ](#クライアントのパッチに関するお知らせ)
- [ダウンロード](#ダウンロード)
- [セットアップ](#セットアップ)
- [トラブルシューティング](#トラブルシューティング)
- [開発者向けクイックスタート](#開発者向けクイックスタート)
  - [セットアップ](#セットアップ)
  - [ビルド](#ビルド)
  - [コードフォーマット・lint](#コードフォーマットlint)
  - [artifactを生成](#artifactを生成)
- [テーマについて](#テーマについて)
- [スクリーンショット](#スクリーンショット)
- [クレジット](#クレジット)

# クライアントのパッチに関するお知らせ

ゲームバージョン3.1以降の場合、CultivationはGrasscutterを使用して起動するときにゲームクライアントに自動的に小さなパッチ(RSAパッチ)を適用し、ゲームを閉じると自動的に解除します。理論上は安全ですが、<strong>ゲームクライアント自体に変更を加えるため、公式サーバーに接続するとBANにつながる可能性があります。</strong>これによるBANについての既知の事例はありませんが、可能性は存在します。

# ダウンロード

[**リリースビルドはこちら**](https://github.com/Grasscutters/Cultivation/releases)

MSIインストーラーをダウンロードして開き、インストールしたら、管理者としてCultivationを実行します。[より詳細なセットアップ手順](#セットアップ)については、以下を参照してください。

**Windows 7をお使いの場合:** [WebView2](https://developer.microsoft.com/ja-jp/microsoft-edge/webview2/#download-section)を手動でダウンロードしてインストールする必要があります。また、Cultivationのインストールには`.msi`の代わりに`.zip`を使用してください。

# セットアップ

5分間の解説動画(英語): https://youtu.be/e0irOYbQe7I

- Cultivationをダウンロードします。
  - Windows 10/11をお使いの場合は、MSIインストーラーを使用してください。
  - Windows 7をお使いの場合またはMSIインストーラーが動作しない場合、ZIPを使用してください。また、[WebView2](https://developer.microsoft.com/ja-jp/microsoft-edge/webview2/)をインストールしてください。
  - GNU/LinuxまたはmacOSをお使いの場合は、[Linux・macOSでの動作をサポートするのを手伝っていただけると嬉しいです!](https://github.com/Grasscutters/Cultivation/issues/7)
- Cultivationをインストールまたは展開します。
- Cultivationを<strong><u>管理者権限で</u></strong>開きます。
- Options(右上の歯車アイコン)内で、ゲームのインストールパスを設定します。
  - 他の場所に既存のGrasscutterサーバーがインストールされている場合は、`.jar`ファイルのパスを設定できます。Cultivationを介して行われるすべてのダウンロードは、そのパスを自動的に使用します。追加の構成は必要ありません。
  - 複数のJavaバージョンを使用している場合、Java 17のパスをCultivationに設定できます(自分でGrasscutterサーバーを実行している場合にのみ必要です)。
- 自分でサーバーをダウンロードするか、公開サーバーに参加するかどうかを決定します。
  - 公開サーバーに参加する場合は、[Grasscutterに接続]をクリックして、アドレスとポートを入力してください。
    - システムエラー、または4214エラーが表示されている場合は、[Discordサポートチャンネル](https://discord.gg/grasscutter)で問い合わせてください。
  - 自分でサーバーをダウンロードする場合は、"Downloads"メニューを開きます。(右上の下矢印アイコン)
    - "Grasscutter All-in-Oneをダウンロード"します。(一番上)
- それが完了したら、「起動」の横にあるサーバーアイコンをクリックします。
- 自分のサーバーでプレイするには:
  - [Grasscutterに接続]をクリックします。
  - アドレスに`localhost`、ポート番号に`443`を指定します。
  - HTTPS接続を無効にします。
- 何らかのエラーが発生した場合は、[Discordサポートチャンネル](https://discord.gg/grasscutter)で問い合わせてください。
- 何らかのCultivationに関する問題は[Issuesページ](/issues)へお願いします。
- 何らかのGrasscutterサーバーに関する問題は[GrasscutterのIssuesページ](https://github.com/Grasscutters/Grasscutter/issues)へお願いします。

# トラブルシューティング

### ホワイトスクリーン、インスタントクラッシュなどの問題

- まず、[Windows 8 互換モード](https://www.lifewire.com/run-older-programs-with-windows-10-compatibility-mode-4587064)で実行してみてください。
- 解決しない場合は、[WebView2](https://developer.microsoft.com/ja-jp/microsoft-edge/webview2/#download-section)を完全にアンインストールしてから再インストールしてみてください。
  - アンインストール時に問題が発生する場合は、`HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}`レジストリを削除して再度試してください。
  - [コマンドプロンプトからアンインストール](https://superuser.com/a/1743626)する方法を試すこともできます。

### Cultivationを使用した後にインターネットに接続できない問題

ゲームを終了すると、Cultivationウィンドウに戻り再びポップアップすることを確認してください。これは、ゲームが終了されたこと、そしてプロキシ設定が正常に戻されたことを示しています。ウィンドウに戻る前にCultivationを閉じた場合、またはインターネットの他の問題が発生した場合は、[Windowsのプロキシ設定](https://is.gd/tZHkvl)を開き、"手動プロキシセットアップ"をオフにしてください。これでインターネット接続は元に戻ります。

# 開発者向けクイックスタート

### セットアップ

- [NodeJS >12](https://nodejs.org/en/) をインストール
- [yarn](https://classic.yarnpkg.com/lang/en/docs/install) をインストール (`npm`愛用者の方々、ごめんなさい...)
- [Rust](https://www.rust-lang.org/tools/install) をインストール
- `yarn install`
- `yarn tauri dev`

### ビルド

リリースビルド:

- `yarn build`

デバッグビルド:

- `yarn build --debug`

### コードフォーマット・lint

- `yarn format`
- `yarn lint`, `yarn lint:fix`

### artifactを生成

- 秘密鍵へのパスを持つ環境変数として`TAURI_PRIVATE_KEY`を追加
- 秘密鍵のパスワードを持つ環境変数として`TAURI_KEY_PASSWORD`を追加
- `yarn build`

アップデートは`src-tauri/target/(release|debug)/msi/Cultivation_X.X.X_x64_xx-XX.msi.zip`へ追加されます

# テーマについて

テーマについての完全なリファレンスは[こちら](/THEMES.md)

# スクリーンショット

![image](https://user-images.githubusercontent.com/107363768/221495236-ca1e2f2e-0f85-4765-a5f3-8bdcea299612.png)
![image](https://user-images.githubusercontent.com/107363768/221495246-ea309640-f866-4f50-bda8-f9d916380f92.png)
![image](https://user-images.githubusercontent.com/107363768/221495249-5a1aac39-9e8a-4244-9642-72c2e7be8a69.png)
![image](https://user-images.githubusercontent.com/107363768/221495254-ffbfc24e-ef5d-4e72-9068-a02132381dcc.png)

## クレジット

- [SpikeHD](https://github.com/SpikeHD): オリジナルである **GrassClipper** を製作し、Cultivationの素晴らしいUIを作成
- [KingRainbow44](https://github.com/KingRainbow44): scratchからプロキシデーモンを作成し、Cultivationへ統合
- [Benj](https://github.com/4Benj): クライアントのパッチに関するアシスタント
- [lilmayofuksu](https://github.com/lilmayofuksu): クライアントのパッチに関するアシスタント
- [Tauri](https://tauri.app): 素晴らしく軽量でシンプルなデスクトップアプリケーションフレームワーク・ライブラリを提供
