import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IdService } from '../../app/services/id.service';
import { LinkPage } from '../link/link';
import { BarcodeScanner } from 'ionic-native';
import { BluetoothSerial } from 'ionic-native';

/*
  Generated class for the Scan page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})
export class ScanPage {
  info: string = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, private _idService: IdService) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad ScanPage');
  }

  private scan(): Promise<any> {
    return BarcodeScanner.scan({
      resultDisplayDuration: 0,
      formats : 'QR_CODE'
    })
  }

  startScan(): void {
    let name: string = null;
    let mac: string = null;
    let otp: string = null;

    BluetoothSerial.enable().then((l) => {
      this.info = JSON.stringify(l);
      return BluetoothSerial.list();
    }).then((l) => {
      this.info = JSON.stringify(l);
      return BluetoothSerial.discoverUnpaired();
    }).then((l) => {
      this.info = JSON.stringify(l);
    }).catch((err) => {
      this.info = 'Error: ' + JSON.stringify(err);
    })

    BluetoothSerial.enable().then(() => {
      return this.scan();
    }).then((result) => {
      const btParams = (result.text as string).split(',');
      name = btParams[0];
      mac = btParams[1];
      otp = btParams[2];
      return BluetoothSerial.list();
    }).then((paired: any[]) => {
      if (!paired.find(p => p.address === mac)) {
        this.info = 'Unable to connect to granter device! Please be sure that you paired your device with granter and try again. ' +
            'To pair your device with granter, open your phone settings and pair a new Bluetooth device with name "' + name + '".'
        return false;
      }
    }).then(() => {
      this.info = 'Connecting to granter...';
      return BluetoothSerial.connect(mac);
    }).then(() => {
      return this._idService.getId();
    }).then((devId) => {
      this.info = 'Requesting permission...';
      return BluetoothSerial.write(devId.toString() + ',' + otp);
    }).then((devId) => {
      this.info = 'Waiting for response...';
      // FIXME read response, send ack
    }).catch((error) => {
      this.info = 'Error: ' + JSON.stringify(error);
    });
  }

  unlink(): void {
    this._idService.delete().then(() => {
      this.navCtrl.setRoot(LinkPage);
    }).catch((err) => {
      this.info = JSON.stringify(err);
    });
  }
}
