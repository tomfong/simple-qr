# Simple QR

<p align="center">
<img alt="Simple QR" src="./resources/icon.png" width="100px">
</p>

<p align="center">
  <a href="#about">About</a>
• <a href="#features">Features</a>
• <a href="#screenshots">Screenshots</a>
• <a href="#download">Download</a>
• <a href="#support-developer">Support Developer</a>
</p>
<p align="center">
  <a href="#contribute">Contribute</a>
• <a href="#contributors">Contributors</a>
• <a href="#changelogs">Changelogs</a>
• <a href="#framework">Framework</a>
• <a href="#privacy-policy">Privacy Policy</a>
• <a href="#license">License</a>
</p>

## About

Simple QR (簡易QR) is an open-source app, providing a simple way for you to scan, create and manage QR codes. No backend service connected. No data collected from you. No ads.

## Features

- Fruitful post actions can be done after scanning a QR code,
  - Search - use scanned content as keyword to execute Google search
  - Copy - one click to copy scanned content
  - Base64 - execute Base64 encode and decode
  - Share - share the original QR code as an image in many platforms
  - Bookmark - save the record by bookmarking it

  For some specific types of QR code, more post actions are provided,
  - URL - one click to open browser and browse the webpage
  - Contact (vCard) - in-app contact adding
  - Phone Number (tel: prefix) - in-app contact adding and phone calling
  - Message (smsto: prefix) -  in-app contact adding and message preparing
  - Email (mailto: prefix) - in-app email preparing
  - Wi-Fi (wifi: prefix) - one click to connect to the Wi-Fi network (for Android 9 or before)
- Flashlight can be enabled during scanning
- A simple UI is provided to create QR codes by inputting text
- Previous scanning records and bookmarks can be viewed and managed
- Settings can be personalized to fit users' requirements, e.g. language, color theme

## Screenshots

<p align="start">
<img alt="scan" src="./screenshots/scan.png" width="125px">
<img alt="result" src="./screenshots/result.png" width="125px">
<img alt="create" src="./screenshots/create.png" width="125px">
<img alt="image" src="./screenshots/image.png" width="125px">
<img alt="history" src="./screenshots/history.png" width="125px">
<img alt="setting" src="./screenshots/setting.png" width="125px">
 </p>

## Languages Supported

- English (en)
- Traditional Chinese 正體中文 (zh-HK)
- Simplified Chinese 简体中文 (zh-CN)

You are welcomed to help us do translations in more languages! (see <a href="#how-to-help-to-do-translation">section</a>)

## Download

Please download the app from Google Play.

<a href="https://play.google.com/store/apps/details?id=com.tomfong.simpleqr">
  <img src="https://cdn.rawgit.com/steverichey/google-play-badge-svg/master/img/en_get.svg" width="30%">
</a>

## Support Developer

To support this project, you can buy me a milk tea by making a donation :) (<a href="mailto:tomfong.dev@gmail.com">Email me</a> for details)

Thanks for your support!

## Contribute

- Star the project
- Do translation for different languages
- Open issue for bug reports
- Email me for any ideas regarding Simple QR or Project Simple

### Build the project

- Run ```npm install``` to install all dependencies
- Run ```npm run build```
- In ```android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml```, add ```android:exported="true"``` inside receiver tag.
- In ```android/capacitor-cordova-android-plugins/src/main/java/nl/xservices/plugins/SocialSharing.java```, change line 274 to

  ```java
  final PendingIntent pendingIntent = PendingIntent.getBroadcast(cordova.getActivity().getApplicationContext(), 0, receiverIntent, PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  ```

- In ```android/app/src/main/res/values/styles.xml```, change

  ```xml
  <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:background">#00a5aa</item>
  </style>
  ```

### How to help to do translation?

0. (Optional) Clone or fork this project
1. Take a look at this [JSON](https://github.com/tomfong/simple-qr/blob/master/src/assets/i18n/en.json)
2. Copy the JSON, rename it to <i>locale</i>.json, e.g. ja.json for Japanese, de.json for German
3. Change the values of each key. Try to stick to the meaning of the original wordings. <b>DO NOT</b> change key names.
4. Commit it (please place the JSON in the same directory, i.e. src/assets/i18n), or [email]('mailto:tomfong.dev@gmail.com') me the JSON.

## Changelogs

### 2.1.0 (Current)

- Correctly display Traditional Chinese if system language is Yue
- Simplified Chinese is supported now
- UI updated: Android native toast, new button layout and more!
- Back button is available on all pages
- Barcode type can be shown after scanning
- Improved performance and fixed known issues

#### 2.0.2

- Fixed QR code sharing crash issue

#### 2.0.0 - 2.0.1

- Revamped the scanning engine
- Removed camera pause feature due to technical problems
- Improved performance and fix issues

#### 1.5.0

- Support Black color theme
- Support zooming in QR code
- Vibration effect update
- Minor UI update
- Improve performance and fix issues

#### 1.4.0

- Migrated the app to Capacitor
- Improve experience when using "Special Actions" feature in Result page
- Show barcode type when scanning
- Improve performance and fix issues

#### 1.3.0 - 1.3.3

- Redesign UI/UX
- Add vibration on/off setting
- Remove WiFi connection feature
- Remove ads
- Improve performance and fix issues

#### 1.2.0 / 1.2.1

- Support image scanning to read QR code
- UI updated
- Improve performance and fix issues

#### 1.1.5

- Support 1D Barcode, Aztec Code, Data Matrix Code and PDF417 Barcode scanning
- Support generating QR code with templates (Free Text, Email, Phone, Message, URL, vCard Contact and Wi-Fi)
- Improve performance of loading records on History page

#### 1.0.2

- Removed in-app purchase

#### 1.0.1

- Support Android 6.0 or above devices

#### 1.0.0

- The first release version. Thanks for your support! Please feel free to rate the app and leave comments.

## Framework

```sh
    Ionic CLI                       : 6.18.1
    Ionic Framework                 : @ionic/angular 5.9.3
    @angular-devkit/build-angular   : 12.2.1
    @angular-devkit/schematics      : 12.2.1
    @angular/cli                    : 12.2.1
    @ionic/angular-toolkit          : 4.0.0

    Capacitor CLI                   : 3.3.3
    @capacitor/android              : 3.3.3
    @capacitor/core                 : 3.3.3

    Cordova CLI                     : 10.0.0

    Android SDK Tools               : 26.1.1
    NodeJS                          : v14.15.4
    npm                             : 6.14.10
```

## Privacy Policy

Please read the [Privacy Policy](https://www.privacypolicies.com/live/771b1123-99bb-4bfe-815e-1046c0437a0f)

## License

Please view the [LICENSE](LICENSE)
