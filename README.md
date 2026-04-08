# Simple QR

[![License](https://img.shields.io/github/license/tomfong/simple-qr?style=flat)](https://github.com/tomfong/simple-qr/blob/main/LICENSE)
[![Last Updated](https://img.shields.io/badge/Last%20Updated-2026--04--09-brightgreen.svg)](https://github.com/tomfong/simple-qr)

> **IMPORTANT NOTE**  
Simple QR now uses `@capacitor-mlkit/barcode-scanning (ML Kit)` instead of `@capacitor-community/barcode-scanner (ZXing)`.

<p align="center"><br><img src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/icon_round.png" width="100" height="100" /></p>
<p align="center">
  <strong>
    Simple QR  
  </strong>
</p>
<br>
<p align="center">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/00.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/01.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/02.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/03.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/04.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/05.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/06.png">
</p>

## About

Simple QR is a lightweight, privacy-first QR and barcode app. It’s designed to be fast and easy to use for everyday scanning and QR creation, with a clean UI and **no backend**, **no ads**, and **no data collection**. It works offline (except for actions you explicitly trigger, like opening a link or searching the web).

It's now available on the following platforms.

| Google Play | GitHub | 
|:-:|:-:|
| [<img src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/google-play-badge.png" height="50">](https://play.google.com/store/apps/details?id=com.tomfong.simpleqr) | [<img src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/github-badge.png" height="50">](https://github.com/tomfong/simple-qr/releases/latest) | 

Author: Tom FONG
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/tomfong)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tom-lh-fong/)

## Features

### Scan

- Scan **QR codes and many common barcode formats** quickly (e.g. UPC/EAN, Code 39/93/128, ITF, Codabar, Aztec, Data Matrix, PDF417, etc.)
- Scan from your **camera** or **import an image** and decode the code from it
- (Android) Start scanning quickly from the **Quick Settings tile**

### Create

- Create QR codes using templates:
  - Free Text, URL, vCard Contact, Phone Number, Message, Email, Wi‑Fi, Geolocation
- Generate a shareable QR code from any result content
- Create QR codes from content **shared to Simple QR** from other apps (Android share sheet)

### Organize

- Automatically keep a **history** of what you scan/create/view
- **Bookmark** frequently used items for quick access
- **Backup/restore** your records

### Actions & utilities

- One-tap actions based on content type (open URLs/apps, add contacts from vCards, call phone numbers, send SMS/email, open locations in maps)
- Quick tools like **copy to clipboard**, **web search**, and **Base64 encode/decode**

### Personalize

- Customize generated QR codes (e.g. error correction, colors, margin) and adjust **screen brightness**
- Customize the app (e.g. start page, language, theme)

### Demo

[![Simple QR Demo](https://img.youtube.com/vi/TIC6ZAkWoXY/0.jpg)](https://www.youtube.com/watch?v=TIC6ZAkWoXY)

### Languages Supported

* English (en)
* Chinese (Hong Kong) 中文 (香港) (zh-HK)
* Chinese (Simplified) 简体中文 (zh-CN)
* German Deutsch (de)
* French Français (fr)
* Italian Italiano (it)
* Portuguese (Brazil) (pt-BR)
* Russian Русский (ru)

You are welcomed to help translate the app into more languages (refer to this <a href="#how-to-help-translate">section</a>)

## Contribute

* Sponsor the project.

  [![GitHub Sponsor](https://img.shields.io/badge/sponsor-30363D?style=flat&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/sponsors/tomfong?frequency=one-time)
  [![Buy me a Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/tomfong)

* Star the project.

  [![Stars](https://img.shields.io/github/stars/tomfong/simple-qr?style=flat)](https://github.com/tomfong/simple-qr/stargazers)

* Open issues to report bugs or share any new ideas.

  [![Issues](https://img.shields.io/github/issues/tomfong/simple-qr?style=flat)](https://github.com/tomfong/simple-qr/issues)

* Translate the app into different languages.

### How to help translate?

1. Take a look at this [JSON](https://github.com/tomfong/simple-qr/blob/master/src/assets/i18n/en.json)
2. Download it, rename it to <i>locale</i>.json, e.g. ja.json for Japanese, de.json for German
3. Change the values of each key.
    * Try to stick to the meaning of the original wordings.
    * Preserve special characters, e.g. ```<p> <b> \n```.
    * Preserve wordings with { }, e.g. ```{secret}```.
    * <b>DO NOT</b> change the key names.
    * <b>DO NOT</b> change the order.
4. Email the JSON to me (tomfong.dev@gmail.com) after you finish.

### Build the project

1. Run ```npm install``` to install all dependencies.
2. Run ```npm run build```

### Contributors

Thank you the following contributors who have made the app better!

| Name | GitHub | How? |
|:-:|:-:|:-:|
| mondstern | [mondlicht-und-sterne](https://github.com/mondlicht-und-sterne) | German language translation |
| Valentino Bocchetti | [luftmensch-luftmensch](https://github.com/luftmensch-luftmensch) | Italian language translation |
| Smooth-E | [Smooth-E](https://github.com/Smooth-E) | Russian language translation |
| Daniel Ribeiro | [drcsj](https://github.com/drcsj) | Portuguese (Brazil) language translation |

## Framework

```sh
  Ionic:
    Ionic CLI                     : 7.2.1 
    Ionic Framework               : @ionic/angular 8.7.3
    @angular-devkit/build-angular : 20.2.0
    @angular-devkit/schematics    : 20.2.0
    @angular/cli                  : 20.2.0
    @ionic/angular-toolkit        : 11.0.1

  Capacitor:
    Capacitor CLI      : 7.4.3
    @capacitor/android : 7.4.3
    @capacitor/core    : 7.4.3
    @capacitor/ios     : 7.4.3
```

## Privacy Policy

Please read the [Privacy Policy](https://www.privacypolicies.com/live/771b1123-99bb-4bfe-815e-1046c0437a0f)

## License

[![License](https://img.shields.io/github/license/tomfong/simple-qr?style=flat)](https://github.com/tomfong/simple-qr/blob/main/LICENSE)

---

_SIMPLE DEV ． SIMPLER WORLD_
