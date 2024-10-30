# Downloading/Installing Themes

1. Download your favorite theme! (You can find some in the `#themes` channel on Discord)
2. Place the unzipped theme folder inside of `%appdata%/cultivation/themes` (The path should look something like this: `cultivation/themes/theme_name/index.json`)
3. Enable within Cultivation!

# Creating your own theme

Themes support entirely custom JS and CSS, enabling you to potentially change every single thing about Cultivation with relative ease.

You can refer to the example theme [found here.](https://github.com/Grasscutters/Cultivation/blob/main/docs/ExampleTheme.zip)

You will need CSS and JS experience if you want to do anything cool.

## Creating index.json

`index.json` is where you tell Cultivation which files and images to include. It supports the following properties:

| Property               | Description                                                                                                                                        |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                 | The name of the theme.                                                                                                                             |
| `version`              | Not shown anywhere, the version of the theme.                                                                                                      |
| `description`          | Not shown anywhere, the description of the theme.                                                                                                  |
| `includes`             | The files and folders to include.                                                                                                                  |
| `includes.css`         | Array of CSS files to include. Example: `css: ["index.css"]`                                                                                       |
| `includes.js`          | Array of JS files to includes. Example `js: ["index.js"]`                                                                                          |
| `customBackgroundURL`  | A custom image URL to set as the background. Backgrounds that users set in their config supercede this. Example: `"https://website.com/image.png"` |
| `customBackgroundFile` | Path to a custom background image file. Backgrounds that users set in their config supercede this. Example: `"/image.png"`                         |

A full, complete `index.json` will look something like this:

```json
{
  "name": "Example",
  "version": "1.0.0",
  "description": "This is an example theme. Made by SpikeHD.",
  "includes": {
    "css": ["/index.css"],
    "js": ["/index.js"]
  },
  "customBackgroundURL": "https://website.com/image.png",
  "customBackgroundFile": "/image.png"
}
```

**Important Note:**
All paths are relative to the theme folder. This means you only need to do `"/index.css"` to include `index.css` from the same folder `index.json` is located.

## Writing your CSS

You are welcome to use the DevTools to debug your theme, or view what properties an element has already, etc.

Below are some small examples of what you can do:

```css
/* Change the font */
body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
}
```

```css
/* Remove the news section */
.NewsSection {
  display: none;
}
```

```css
/* Change the right bar width */
.RightBar {
  width: 300px;
}
```

## How can I change XYZ element?

Every element is documented and describe [here](/docs/elementIds.md). Every\* single DOM element is assigned an ID to allow for easy and hyper-specific editing.

## Writing your JS

There are no limitations to what you can do with JS. It is safe, as it is sandboxed within the webpage, so there is no possibility of it being able to do anything more than what any regular webpage can do.

Below are some examples of what you can do:

```js
/* Change the version number every 500ms */
setInterval(() => {
  document.getElementById('version').innerHTML = 'v' + Math.floor(Math.random() * 100)
}, 500)
```

```js
/* Load a custom font */
const head = document.head
const link = document.createElement('link')

link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
link.rel = 'stylesheet'
link.type = 'text/css'

head.appendChild(link)
```

```js
/* Create a new button that does nothing */
const newButton = document.createElement('button')
newButton.innerHTML = 'New Button'

document.body.appendChild(newButton)
```
