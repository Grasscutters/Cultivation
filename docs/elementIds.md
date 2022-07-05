# Documentation of Element ID's and Classes for custom theming

## IDs
This does not include commonly used components (buttons, divider lines, commit author and message, etc...) for accessing and modifying those elements, please check `Classes` section bellow.

| #ID                                    | Description                                                     |
|----------------------------------------|-----------------------------------------------------------------|
| `#miniDialogContainer`                 | Main container of MiniDialog                                    |
| `#miniDialogContainerTop`              | Affects only top section of MiniDialog                          |
| `#miniDialogButtonClose`               | Close button (SVG) of MiniDialog                                |
| `#miniDialogContent`                   | MiniDialog content                                              |
| `#rightBarContainer`                   | Main container of RightBar                                      |
| `#rightBarContent`                     | RightBar content                                                |
| `#rightBarButtonDiscord`               | Discord button on the RightBar                                  |
| `#rightBarButtonGithub`                | Github button on the RightBar                                   |
| `#playButton`                          | Main container for whole launch buttons section                 |
| `#serverControls`                      | Container of "play on grasscutter" checkbox                     |
| `#enableGC`                            | "play on grasscutter" checkbox                                  |
| `#ip`                                  | Server ip input if play on grasscutter is enabled               |
| `#port`                                | Server port input if play on grasscutter is enabled             |
| `#httpsEnable`                         | "Enable https" checkbox if play on grasscutter is enabled       |
| `#officialPlay`                        | Launch button                                                   |
| `#serverLaunch`                        | Launch server button                                            |
| `#serverlaunchIcon`                    | Icon (SVG) of server launch button                              |
| `#serverConfigContainer`               | Main container of server configuration section                  |
| `#serverLaunchContainer`               | Main container of launch buttons (includes launch server)       |
| `#topBarContainer`                     | Main container of launcher TopBar (minimize, exit, settings...) |
| `#title`                               | Title of the TopBar                                             |
| `#version`                             | Version of the launcher in TopBar                               |
| `#topBarButtonContainer`               | Container of launcher TopBar buttons only                       |
| `#closeBtn`                            | Exit launcher button                                            |
| `#minBtn`                              | Minimize launcher button                                        |
| `#settingsBtn`                         | Settings button                                                 |
| `#downloadsBtn`                        | Downloads button (grasscutter resources, grasscutter...)        |
| `#newsContainer`                       | Main container of the news section                              |
| `#newsTabsContainer`                   | Container for news tabs                                         |
| `#commits`                             | News tabs container commits button                              |
| `#latest_version`                      | News tabs for latest version button                             |
| `#newsContent`                         | Content section of news container                               |
| `#newsCommitsTable`                    | Commits table of news section                                   |
| `#downloadMenuContainerGCStable`       | Grasscutter stable update container                             |
| `#downloadMenuLabelGCStable`           | Label for stable update button                                  |
| `#downloadMenuButtonGCStable`          | Button container for stable update button                       |
| `#grasscutterStableBtn`                | "Update grasscutter stable" button                              |
| `#downloadMenuContainerGCDev`          | Grasscutter development update container                        |
| `#downloadMenuLabelGCDev`              | Label for latest update button                                  |
| `#downloadMenuButtonGCDev`             | Button container for latest update button                       |
| `grasscutterLatestBtn`                 | "Update grasscutter latest" button                              |
| `#downloadMenuContainerGCStableData`   | Grasscutter stable data update container                        |
| `#downloadMenuLabelGCStableData`       | Label for stable data update                                    |
| `#downloadMenuButtonGCStableData`      | Button container for stable data update button                  |
| `#grasscutterStableRepo`               | "Update grasscutter stable data" button                         |
| `#downloadMenuContainerGCDevData`      | Grasscutter latest data update container                        |
| `#downloadMenuLabelGCDevData`          | Label for latest data update                                    |
| `#downloadMenuButtonGCDevData`         | Button container for latest data update button                  |
| `#grasscutterDevRepo`                  | "Update grasscutter latest data" button                         |
| `#downloadMenuContainerResources`      | Container for grasscutter resources download                    |
| `#downloadMenuLabelResources`          | label for resources download                                    |
| `#downloadMenuButtonResources`         | Button container for resources download button                  |
| `#resourcesBtn`                        | "Download grasscutter resources" button                         |
| `#menuContainer`                       | Generic Popup modal like menu container                         |
| `#menuContainerTop`                    | Top section of menu container                                   |
| `#menuHeading`                         | Menu title                                                      |
| `#menuButtonCloseContainer`            | Container for menu close button                                 |
| `#menuButtonCloseIcon`                 | Menu close icon (SVG)                                           |
| `#menuContent`                         | Content section of the menu                                     |
| `#menuOptionsContainerGameExec`        | Container for game executable option section                    |
| `#menuOptionsLabelGameExec`            | Label for game executable option                                |
| `#menuOptionsDirGameExec`              | Set game executable file browser                                |
| `#menuOptionsContainerGCJar`           | Container for grasscutter jar option                            |
| `#menuOptionsLabelGCJar`               | Label for grasscutter jar option                                |
| `#menuOptionsDirGCJar`                 | Set grasscutter jar file browser                                |
| `#menuOptionsContainerToggleEnc`       | Container for toggle encryption option                          |
| `#menuOptionsLabelToggleEnc`           | Label for toggle encryption option                              |
| `#menuOptionsButtonToggleEnc`          | Toggle encryption button container                              |
| `#toggleEnc`                           | Toggle encryption button                                        |
| `#menuOptionsContainerGCWGame`         | Container for "grasscutter with game" option                    |
| `#menuOptionsLabelGCWDame`             | Label for "grasscutter with game" option                        |
| `#menuOptionsCheckboxGCWGame`          | Container for "grasscutter with game" option checkbox           |
| `#gcWithGame`                          | Grasscutter with game checkbox                                  |
| `#menuOptionsContainerThemes`          | Container for themes section                                    |
| `#menuOptionsLabelThemes`              | Label for set themes option                                     |
| `#menuOptionsSelectThemes`             | Container for themes select menu                                |
| `#menuOptionsSelectMenuThemes`         | Set theme select menu                                           |
| `#menuOptionsContainerJavaPath`        | Container for Java Path option                                  |
| `#menuOptionsLabelJavaPath`            | Label for Java path option                                      |
| `#menuOptionsDirJavaPath`              | Container for java path file browser                            |
| `#menuOptionsContainerBG`              | Container for Background option                                 |
| `#menuOptionsLabelBG`                  | Label for background option                                     |
| `#menuOptionsDirBG`                    | Container for background url/local path option                  |
| `#menuOptionsContainerLang`            | Container for language change option                            |
| `#menuOptionsLabelLang`                | Label for language change option                                |
| `#menuOptionsSelectLang`               | Container for language change select menu                       |
| `#menuOptionsSelectMenuLang`           | Language select menu                                            |
| `#DownloadProgress`                    | Download progress container                                     |
| `#bottomSectionContainer`              | Bottom section container                                        |
| `#miniDownloadContainer`               | Container for mini download                                     |

## Classes
This is not full list of all classes, rather its list of classes for commonly used components that can not be accessed using element id system.

| .Class                      | Description                                             |
|-----------------------------|---------------------------------------------------------|
| `.BigButton`                | Class for all buttons                                   |
| `.BigButtonText`            | Text inside a button                                    |
| `.BigButton:hover`          | Hover state of all buttons                              |
| `.BigButton.disabled`       | Disabled state of all buttons                           |
| `.BigButton.disabled:hover` | Disabled state with hover                               |
| `.Checkbox`                 | Checkbox container                                      |
| `.CheckboxDisplay`          | Content of checkbox                                     |
| `.DirInput`                 | Container for DirInput                                  |
| `.FileSelectIcon`           | Icon of DirInput                                        |
| `.DownloadList`             | List of all downloads                                   |
| `.DownloadSection`          | Container for each download                             |
| `.DownloadTitle`            | Contains file download path and current status          |
| `.DownloadPath`             | Path of a download                                      |
| `.DownloadStatus`           | Status of a download                                    |
| `.DownloadSectionInner`     | Contains progressbar of the download section            |
| `.HelpSection`              | Container for help "?" circle button                    |
| `.HelpButton`               | HelpButton itself                                       |
| `.HelpContents`             | Content of help button once expanded                    |
| `.MainProgressBarWrapper`   | Container for MainProgressBar                           |
| `.ProgressBar`              | ProgressBar (creativity left the brain)                 |
| `.InnerProgress`            | ProgressBar percentage                                  |
| `.MainProgressText`         | Text for MainProgressBar                                |
| `.ProgressBarWrapper`       | Container for ProgressBar                               |
| `.DownloadControls`         | DownloadControls of ProgressBar                         |
| `.downloadStop`             | Container for download stop icon (SVG)                  |
| `.ProgressText`             | Text of the ProgressBar display current download status |
| `.TextInputWrapper`         | Container for TextInput                                 |
| `.TextClear`                | Container for clear input content button                |
| `.TextInputClear`           | TextInput clear button icon (SVG)                       |
| `.Divider`                  | Container for line dividers                             |
| `.DividerLine`              | Divider line itself                                     |
| `.CommitAuthor`             | Author of a commit                                      |
| `.CommitMessage`            | Message of a commit                                     |