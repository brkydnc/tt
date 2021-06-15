# Tureng Translate
This is a simple translate extension. Under the hood, this is just a basic scraper for [Tureng](https://tureng.com) translation pages.

# Browser support
Features are handled using [webextension-polyfill](https://github.com/mozilla/webextension-polyfill) for Chrome and Opera.
| Feature                                 | Firefox | Chrome | Opera |
|----------------------------------------:|:-------:|:------:|:-----:|
| Open popup (shortcut)                   |✔️        |✔️       |✔️      |
| Translate in popup                      |✔️        |✔️       |✔️      |
| Translate selection in panel            |✔️        |✔️       |✔️      |
| Translate selection in popup (shortcut) |✔️        |❌      |❌     |

# Packaging & Usage
### Firefox
You can download it from [firefox addons](https://addons.mozilla.org/firefox/addon/tureng-translate/).
### Chrome & Opera
You have to turn on `Developer Mode` and then load the extension unpacked.

# Known bugs
* Some sites won't allow loading fonts. (CSP) 
* Fonts aren't loaded on Chrome & Opera.

# Acknowledgements
I 'd like to thank [oyavri](https://github.com/oyavri) for sharing his ideas, and [Tibrikci](https://github.com/Tibrikci) for designing the extension icon.
