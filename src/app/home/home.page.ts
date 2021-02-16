/*
* Copyright (C) 2021 Zebra Technologies Corp
* All rights reserved.
*/

import { Component, ChangeDetectorRef } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { BarcodeService } from '../barcode.service';

import { Events } from '../services/events';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
const { Device } = Plugins;
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private scans = [];
  private scanners = [{ "SCANNER_NAME": "Please Wait...", "SCANNER_INDEX": 0, "SCANNER_CONNECTION_STATE": true }];
  private selectedScanner = "Please Select...";
  private selectedScannerId = -1;
  private ean8Decoder = true;   //  Model for decoder
  private ean13Decoder = true;  //  Model for decoder
  private code39Decoder = true; //  Model for decoder
  private code128Decoder = true;//  Model for decoder
  private dataWedgeVersion = "Pre 6.3. Please create & configure profile manually.  See the ReadMe for more details.";
  private availableScannersText = "Requires Datawedge 6.3+"
  private activeProfileText = "Requires Datawedge 6.3+";
  private commandResultText = "Messages from DataWedge will go here";
  private uiHideDecoders = true;
  private uiDatawedgeVersionAttention = true;
  private uiHideSelectScanner = true;
  private uiHideShowAvailableScanners = false;
  private uiHideCommandMessages = true;
  private uiHideFloatingActionButton = true;

  constructor(private barcodeProvider: BarcodeService,
    public events: Events, private changeDetectorRef: ChangeDetectorRef, 
    private alertController: AlertController, private platform: Platform, private toastController: ToastController) {

      this.platform.ready().then((readySource) => {
        this.checkZebraDevice();

        //  Determine the version.  We can add additional functionality if a more recent version of the DW API is present
        this.barcodeProvider.sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");
  
        ////////////////////////////
        //  EVENT HANDLING
        ////////////////////////////
  
        //  6.3 DataWedge APIs are available
        events.subscribe('status:dw63ApisAvailable', (isAvailable) => {
          console.log("DataWedge 6.3 APIs are available");
          //  We are able to create the profile under 6.3.  If no further version events are received, notify the user
          //  they will need to create the profile manually
          this.barcodeProvider.sendCommand("com.symbol.datawedge.api.CREATE_PROFILE", "IonicCapacitorDemo");
          this.dataWedgeVersion = "6.3.  Please configure profile manually.  See the ReadMe for more details.";
  
          //  Although we created the profile we can only configure it with DW 6.4.
          this.barcodeProvider.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
  
          //  Enumerate the available scanners on the device
          this.barcodeProvider.sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");
  
          //  Functionality of the FAB is available so display the button
          this.uiHideFloatingActionButton = false;
  
          this.changeDetectorRef.detectChanges();
        });
  
        //  6.4 Datawedge APIs are available
        events.subscribe('status:dw64ApisAvailable', (isAvailable) => {
          console.log("DataWedge 6.4 APIs are available");
  
          //  Documentation states the ability to set a profile config is only available from DW 6.4.
          //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
          this.dataWedgeVersion = "6.4";
          this.uiDatawedgeVersionAttention = false;
          this.uiHideDecoders = !isAvailable;
  
          //  Configure the created profile (associated app and keyboard plugin)
          let profileConfig = {
            "PROFILE_NAME": "IonicCapacitorDemo",
            "PROFILE_ENABLED": "true",
            "CONFIG_MODE": "UPDATE",
            "PLUGIN_CONFIG": {
              "PLUGIN_NAME": "BARCODE",
              "RESET_CONFIG": "true",
              "PARAM_LIST": {}
            },
            "APP_LIST": [{
              "PACKAGE_NAME": "com.zebra.ioniccapacitordemo",
              "ACTIVITY_LIST": ["*"]
            }]
          };
          this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
  
          //  Configure the created profile (intent plugin)
          let profileConfig2 = {
            "PROFILE_NAME": "IonicCapacitorDemo",
            "PROFILE_ENABLED": "true",
            "CONFIG_MODE": "UPDATE",
            "PLUGIN_CONFIG": {
              "PLUGIN_NAME": "INTENT",
              "RESET_CONFIG": "true",
              "PARAM_LIST": {
                "intent_output_enabled": "true",
                "intent_action": "com.zebra.ionic.capacitor.ACTION",
                "intent_delivery": "2"
              }
            }
          };
          this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);
  
          //  Give some time for the profile to settle then query its value
          setTimeout(function () {
            barcodeProvider.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
          }, 1000);
  
          this.changeDetectorRef.detectChanges();
        });
  
        //  6.5 Datawedge APIs are available
        events.subscribe('status:dw65ApisAvailable', (isAvailable) => {
          console.log("DataWedge 6.5 APIs are available");
  
          //  The ability to switch to a new scanner is only available from DW 6.5 onwards
          //  Reconfigure UI so the user can choose the desired scanner
          this.uiHideSelectScanner = false;
          this.uiHideShowAvailableScanners = true;
  
          //  6.5 also introduced messages which are received from the API to indicate success / failure
          this.uiHideCommandMessages = false;
          this.barcodeProvider.requestResult(true);
          this.dataWedgeVersion = "6.5 or higher";
          this.changeDetectorRef.detectChanges();
        });
  
        //  Response to our request to find out the active DW profile
        events.subscribe('data:activeProfile', (activeProfile) => {
          console.log("Active profile: " + activeProfile);
  
          //  Update the UI
          this.activeProfileText = activeProfile;
  
          this.changeDetectorRef.detectChanges();
        });
  
        //  The result (success / failure) of our last API call along with additional information
        events.subscribe('data:commandResult', (commandResult) => {
          this.commandResultText = commandResult;
          this.changeDetectorRef.detectChanges();
        });
  
        //  Response to our request to enumerte the scanners
        events.subscribe('data:enumeratedScanners', (enumeratedScanners) => {
          //  Maintain two lists, the first for devices which support DW 6.5+ and shows a combo box to select
          //  the scanner to use.  The second will just display the available scanners in a list and be available
          //  for 6.4 and below
          this.scanners = enumeratedScanners;
          let humanReadableScannerList = "";
          enumeratedScanners.forEach((scanner, index) => {
            console.log("Scanner found: name= " + scanner.SCANNER_NAME + ", id=" + scanner.SCANNER_INDEX + ", connected=" + scanner.SCANNER_CONNECTION_STATE);
            humanReadableScannerList += scanner.SCANNER_NAME;
            if (index < enumeratedScanners.length - 1)
              humanReadableScannerList += ", ";
          });
          this.availableScannersText = humanReadableScannerList;
          this.scanners.unshift({"SCANNER_NAME": "Please Select...", "SCANNER_INDEX":-1, "SCANNER_CONNECTION_STATE":false});
          this.changeDetectorRef.detectChanges();
        });
  
        //  A scan has been received
        events.subscribe('data:scan', (data: any) => {
          //  Update the list of scanned barcodes
          let scannedData = data.scanData.extras["com.symbol.datawedge.data_string"];
          let scannedType = data.scanData.extras["com.symbol.datawedge.label_type"];
          this.scans.unshift({ "data": scannedData, "type": scannedType, "timeAtDecode": data.time });
  
          //  On older devices, if a scan is received we can assume the profile was correctly configured manually
          //  so remove the yellow highlight.
          this.uiDatawedgeVersionAttention = false;
  
          this.changeDetectorRef.detectChanges();
        });
  
      });

    }

  //  Function to handle changes in the decoder checkboxes.  
  //  Note: SET_CONFIG only available on DW 6.4+ per the docs
  public setDecoders() {
    var paramList = {
      "scanner_selection": "auto",
      "decoder_ean8": "" + this.ean8Decoder,
      "decoder_ean13": "" + this.ean13Decoder,
      "decoder_code128": "" + this.code128Decoder,
      "decoder_code39": "" + this.code39Decoder
    }
    //  The "scanner_selection" parameter supports "auto" to apply to the default scanner.
    //  If we have selected a different scanner we need to ensure the settings are applied
    //  to the correct scanner by specifying "current-device-id".  See http://techdocs.zebra.com/datawedge/6-7/guide/api/setconfig/
    //  for more information.  selectedScannerId will be >-1 if the user has chosen a specific scanner.
    if (this.selectedScannerId > -1)
    {
      paramList["current-device-id"] = "" + this.selectedScannerId;
      delete paramList["scanner_selection"];
    }
    //  Set the new configuration
    let profileConfig = {
      "PROFILE_NAME": "IonicCapacitorDemo",
      "PROFILE_ENABLED": "true",
      "CONFIG_MODE": "UPDATE",
      "PLUGIN_CONFIG": {
        "PLUGIN_NAME": "BARCODE",
        "PARAM_LIST": paramList
      }
    };
    this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
  }

  private async checkZebraDevice() {
    //  Check manufacturer.  Exit if this app is not running on a Zebra device
    const info = await Device.getInfo();
    const manufacturer = info.manufacturer;
    console.log("Device manufacturer is: " + manufacturer);
    if (!(manufacturer.toLowerCase().includes("zebra") || manufacturer.toLowerCase().includes("motorola solutions"))) {
      console.log("Presenting alert");
      this.presentAlert();
    }
  }

  private async presentAlert() {
    let alert = await this.alertController.create({
      subHeader: 'Requires Zebra device',
      message: 'This application requires a Zebra mobile device in order to run',
      cssClass: 'nonZebraAlert',
      buttons: [{
        text: 'Close app',
        handler: data => {
          console.log('Closing application since we are not running on a Zebra device');
          navigator['app'].exitApp();
        }
      }]
    });
    await alert.present();
  }

  //  Function to handle the user selecting a new scanner
  //  Note: SWITCH_SCANNER only available on DW 6.5+
  public async scannerSelected() {
    console.log("Requested scanner is: " + this.selectedScanner);
    let localScannerIndex = 0;
    let localScannerName = "";
    for (let scanner of this.scanners) {
      //  The current scanner will be returned as SCANNER_CONNECTION_STATE
      if (scanner.SCANNER_NAME == this.selectedScanner) {
        localScannerIndex = scanner.SCANNER_INDEX;
        localScannerName = scanner.SCANNER_NAME;
      }
    }
    if (this.selectedScannerId == localScannerIndex || localScannerIndex < 0) {
      console.log("Not switching scanner, new scanner ID == old scanner ID");
      let toast = await this.toastController.create({
        message: 'Invalid scanner selection',
        position: 'bottom',
        duration:3000
      });
      await toast.present();
      return;
    }
    this.selectedScanner = localScannerName;
    this.selectedScannerId = localScannerIndex;
    this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SWITCH_SCANNER", localScannerIndex + "");
    //  Enumerate the scanner - this will update the actual scanner in use so we do not have to worry about whether SWITCH_SCANNER succeeded
    this.barcodeProvider.sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");
  }

  //  Function to handle the floating action button onDown.  Start a soft scan.
  public fabDown() {
    this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", "START_SCANNING");
  }

  //  Function to handle the floating action button onUp.  Cancel any soft scan in progress.
  public fabUp() {
    this.barcodeProvider.sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", "STOP_SCANNING");
  }

}
