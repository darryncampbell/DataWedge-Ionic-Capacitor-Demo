# DataWedge-Ionic-Capacitor-Demo

This project shows a sample Ionic application with the Capacitor runtime which uses DataWedge to capture barcode data on Zebra Android mobile devices. 

![Applictaion](https://raw.githubusercontent.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo/master/screenshots/1.jpg)

## Prerequisites:

- Install Capacitor [https://capacitorjs.com/docs/getting-started](https://capacitorjs.com/docs/getting-started)
- Command line Reference [https://ionicframework.com/docs/cli/commands/capacitor-run](https://ionicframework.com/docs/cli/commands/capacitor-run)

### Download and prepare project:

```
git clone https://github.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo.git
cd DataWedge-Ionic-Capacitor-Demo
npm update
npx cap update
```
### Running this project on Android (will launch Android Studio)

Connect a Zebra Android device then execute:
```
ionic capacitor run android
```

### Building this project

```
ionic capacitor build android
```

### Adding plugin to new project:

This application uses a 3rd party Cordova plugin to interface with DataWedge via Intents.  To add this Cordova plugin to your application run the following commands: 

```
npm i com-darryncampbell-cordova-plugin-intent
npx cap update
```

## DataWedge

This application is designed to use DataWedge. DataWedge is only available on Zebra mobile computing devices and provides access to the device hardware scanner(s) including the laser imager, attached Bluetooth scanners and camera imager; **it is not a software scanning library**.

## Setup

Any Zebra mobile computer running Android which supports Datawedge should work with this sample but the complexity of setup will depend on which version you are running.

**If your device is running Datawedge 6.4 or higher you will see no warning messages and can safely skip these steps**

You will see this message if you are running a version of Datawedge prior to 6.3:

![pre 6.3 warning message](https://raw.githubusercontent.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo/master/screenshots/pre_6.3.jpg)

And this message if you are running Datawedge 6.3:

![6.3 warning message](https://raw.githubusercontent.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo/master/screenshots/6.3.jpg)

In either case, ensure you have a Datawedge profile on the device. You can do this by:

- Launching the Datawedge application
- (Prior to 6.3 only) Select Menu --> New Profile and name the profile `IonicCapacitorDemo`
- Configure the `IonicCapacitorDemo` profile to
  - Associate the profile with com.zebra.ioniccapacitordemo, with * Activities
  - Configure the intent output plugin to send broadcast intents to com.zebra.ionicdemo.ACTION

![Associated apps](https://raw.githubusercontent.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo/master/screenshots/dw2.jpg)

![DataWedge Intent Output](https://raw.githubusercontent.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo/master/screenshots/dw4.jpg)

## Use

There are two sections to the UI, at the top you can configure scanning attributes such as choosing the supported decoders. Note that some configuration features will require a minimum version of Datawedge. You can initiate a soft trigger scan using the floating action button.

**ALL** versions of Datawedge support scanning barcodes.

## Common Issues

Issue:
If you see the following message when building: `cordova.variables.gradle as it does not exist.`

Resolution:
You have missed out the `npx cap update` call

## Dependencies

In order to interact with the Datawedge service on Zebra devices this application relies on a 3rd party component to provide the Android Intent interface. Please be sure to add the [Cordova plugin intent package](https://www.npmjs.com/package/com-darryncampbell-cordova-plugin-intent) to your application if you are using this code as a template for your own application:

```
npm i com-darryncampbell-cordova-plugin-intent
npx cap update
```

Note: Ionic Capacitor is backwardly compatible with previous Cordova plugins.