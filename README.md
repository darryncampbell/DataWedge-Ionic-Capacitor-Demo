# DataWedge-Ionic-Capacitor-Demo
Sample application showing an Ionic Capacitor app on Zebra Android devices

##  TODO

- Report the actual version of DataWedge
- Retake screenshots
- Tidy code
- Update Readme

## Notes

Prerequisites:

- Install Capacitor https://capacitorjs.com/docs/getting-started
- Additional Command line https://ionicframework.com/docs/cli/commands/capacitor-run

Download and prepare project:

```
git clone https://github.com/darryncampbell/DataWedge-Ionic-Capacitor-Demo.git
cd DataWedge-Ionic-Capacitor-Demo
npm update
npx cap update
```

Running this project on Android (will launch Android Studio)

```
ionic capacitor run android
```

Building this project

```
ionic capacitor build android
```

Adding plugin to new project:

```
npm i com-darryncampbell-cordova-plugin-intent
npx cap update
```

## Common Issues

- If you see the following message when building: `cordova.variables.gradle as it does not exist.`
  You have missed out the `npx cap update` call
