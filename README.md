# Simple QR

<p align="center"><br><img src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/icon_round.png" width="100" height="100" /></p>
<p align="center">
  <strong>
    Simple QR  
  </strong>
</p>
<p align="center">
  Simple and lightweight app to scan, create and store QR codes
</p>
<br>
<p align="center">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/screenshot_1.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/screenshot_2.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/screenshot_3.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/screenshot_4.png">
  <img height="300" src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/screenshot_5.png">
</p>

## About

Simple QR is a FOSS app to scan, create and store QR codes with a simple UI and experience. No backend service connected. No data collected. No ads.

It's now available on the following platforms.

| App Store | Google Play | GitHub | IzzyOnDroid |
|:-:|:-:|:-:|:-:|
| [<img src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/appstore-badge.png" height="50">](https://apps.apple.com/us/app/simple-qr-by-tom-fong/id1621121553) | [<img src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/google-play-badge.png" height="50">](https://play.google.com/store/apps/details?id=com.tomfong.simpleqr) | [<img src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/github-badge.png" height="50">](https://github.com/tomfong/simple-qr/releases/latest) | [<img src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/IzzyOnDroid-badge.png" height="50">](https://apt.izzysoft.de/fdroid/index/apk/com.tomfong.simpleqr) |

## Features

By using the app, you can

1. Scan QR Code and other barcodes in a second, including UPC, EAN, Code 39/128, ITF, Codabar, Aztec, Data Matrix, PDF417, MaxiCode and GS1 DataBar.

2. Import image files and scan the QR Code on it.

3. Create QR code from templates, which includes Free Text, URL, vCard Contact, Phone Number, Message, Email and Wi-Fi.

4. Automatically log results that you scan, create or view again. These logged records can be bookmarked for quick access, and also backupable.

5. Do tasks on the result content with a tap, including but not limited to
    * Use it as a keyword to do web search.
    * Quickly copy it to the clipboard.
    * Execute base64 encoding/decoding on it.
    * Use it as a content to generate a new shareable QR code.
    * Do corresponding tasks if it is a
      * URL: Browse website
      * vCard contact: Add contact
      * Phone number: Phone call, add contact
      * Message: Send message, add contact
      * Email: Send email

6. Customize the generated QR code, e.g. error correction level, color, margin and screen brightness.

7. Customize the app, e.g. app initial page, language and color theme etc.

### Demo

[![Simple QR Demo](https://img.youtube.com/vi/TIC6ZAkWoXY/0.jpg)](https://www.youtube.com/watch?v=TIC6ZAkWoXY)

### Languages Supported

* English (en)
* Traditional Chinese 正體中文 (zh)
* Simplified Chinese 简体中文 (zh-CN)
* German Deutsch (de)
* French Français (fr)
* Italian Italiano (it)

You are welcomed to help translate the app into more languages (refer to this <a href="#how-to-help-translate">section</a>)

## Contribute

* Sponsor the project.

  <div>
      <a href="https://linktr.ee/tomfonghk"><img src="https://raw.githubusercontent.com/tomfong/simple-qr/main/.github/images/Paypal-badge.png" width="170" alt="tomfong"/></a>
      <a href="https://www.buymeacoffee.com/tomfong"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="50" width="180" alt="tomfong" /></a>
  </div>

* Star the project.

  [![Stars](https://img.shields.io/github/stars/tomfong/simple-qr?style=flat)](https://github.com/tomfong/simple-qr/stargazers)

* Open issues to report bugs or share any new ideas.

  [![Issues](https://img.shields.io/bitbucket/issues-raw/tomfong/simple-qr?style=flat)](https://github.com/tomfong/simple-qr/issues)

* Translate the app into different languages.

### How to help translate?

1. Take a look at this [JSON](https://github.com/tomfong/simple-qr/blob/master/src/assets/i18n/en.json)
2. Download it, rename it to <i>locale</i>.json, e.g. ja.json for Japanese, de.json for German
3. Change the values of each key.
    * Try to stick to the meaning of the original wordings.
    * Preserve special characters, e.g. ```<p> <b> \n```.
    * Preserve wordings with { }, e.g. ```{secret}```.
    * Preserve wordings with \" \", e.g. ```\"cozmo/jsQR\"```.
    * <b>DO NOT</b> change the key names.
    * <b>DO NOT</b> change the order.
4. Email the JSON to me (tomfong.dev@gmail.com) after you finish.

### Build the project (Android)

1. Run ```npm install``` to install all dependencies
2. Run ```npm run sync``` and ```npm run copy:an```
3. In ```android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml```, add ```android:exported="true"``` inside receiver tag.
4. In ```android/capacitor-cordova-android-plugins/src/main/java/nl/xservices/plugins/SocialSharing.java```, change line 274 to

    ```java
    final PendingIntent pendingIntent = PendingIntent.getBroadcast(cordova.getActivity().getApplicationContext(), 0, receiverIntent, PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    ```

5. In ```android/app/src/main/res/values/styles.xml```, change

    ```xml
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
      <item name="android:background">#00a5aa</item>
    </style>
    ```

### Contributors

Thank you the following contributors who have made the app better!

| Name | GitHub | How? |
|:-:|:-:|:-:|
| mondstern | [mondlicht-und-sterne](https://github.com/mondlicht-und-sterne) | German language translation |
| Valentino Bocchetti | [luftmensch-luftmensch](https://github.com/luftmensch-luftmensch) | Italian language translation |

## Framework

```sh
    Ionic CLI                       : 6.19.0
    Ionic Framework                 : @ionic/angular 6.1.8
    @angular-devkit/build-angular   : 13.3.7
    @angular-devkit/schematics      : 13.3.7
    @angular/cli                    : 13.3.7
    @ionic/angular-toolkit          : 6.1.0

    Capacitor CLI                   : 3.5.1
    @capacitor/android              : 3.5.1
    @capacitor/core                 : 3.5.1
    @capacitor/ios                  : 3.5.1

    Android SDK Tools               : 26.1.1
    NodeJS                          : v16.15.4
    npm                             : 8.8.0
```

## Privacy Policy

Please read the [Privacy Policy](https://www.privacypolicies.com/live/771b1123-99bb-4bfe-815e-1046c0437a0f)

## License

[![License](https://img.shields.io/github/license/tomfong/simple-qr?style=flat)](https://github.com/tomfong/simple-qr/blob/main/LICENSE)
