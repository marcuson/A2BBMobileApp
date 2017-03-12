import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IdService } from '../../app/services/id.service';
import { LinkPage } from '../link/link';
import { BarcodeScanner } from 'ionic-native';
import { BluetoothSerial } from 'ionic-native';
import { Subscription } from 'rxjs';

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
  granted?: boolean = null;
  btConnSub: Subscription = null;
  btDataSub: Subscription = null;

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

  private reset(resGranted?: boolean): void {
    if (resGranted == true) {
      this.granted = null;
      this.info = '';
    }

    if (this.btConnSub != null) {
      this.btConnSub.unsubscribe();
      this.btConnSub = null;
    }

    if (this.btDataSub != null) {
      this.btDataSub.unsubscribe();
      this.btDataSub = null;
    }
  }

  startScan(): void {
    this.reset(true);

    let name: string = null;
    let mac: string = null;
    let otp: string = null;

    let dataPromise: Promise<any>;

    BluetoothSerial.isEnabled().then((val) => {
    }).catch(() => {
      this.info = 'Bluetooth is disabled, enable it.'
      return BluetoothSerial.enable();
    }).then(() => {
      return this.scan();
    }).then((result) => {
      const btParams = (result.text as string).split(',');
      mac = btParams[0];
      name = btParams[1];
      otp = btParams[2];
      this.info = 'Found "' + name + '" (MAC ' + mac+ ') with '
          + 'OTP ' + otp;
      return BluetoothSerial.list();
    }).then((paired: any[]) => {
      if (!paired.find(p => p.address === mac)) {
        this.info = 'Unable to connect to granter device! Please be sure that you paired your device with granter and try again. ' +
            'To pair your device with granter, open your phone settings and pair a new Bluetooth device with name "' + name + '".'
        return false;
      }
    }).then(() => {
      this.info = 'Connecting to granter...';

      dataPromise = new Promise((resolve, reject) => {
        this.btDataSub = BluetoothSerial.subscribe(';').subscribe(
          (x) => {
            console.log('Data received: ' + x);
            resolve(x);
          },
          (e) => {
            reject(e);
          },
          () => {
            console.log('BT data receive complete');
          }
        );
      });

      return new Promise((resolve, reject) => {
        this.btConnSub = BluetoothSerial.connect(mac).subscribe(
          (x) => {
            console.log('Connected: ' + x);
            resolve();
          },
          (e) => {
            reject(e);
          },
          () => {
            console.log('BT connection closed');
          }
        );
      });
    }).then(() => {
      this.info = 'Get device id...';
      return this._idService.getId();
    }).then((devId) => {
      this.info = 'Requesting permission (with device id "' + devId + '")...';
      return BluetoothSerial.write('+dev+' + devId.toString() + ',' + otp + '+');
    }).then((devId) => {
      this.info = 'Waiting for response...';
      return dataPromise;
    }).then((btData) => {
      this.info = 'Data received: ' + btData;
      this.granted = btData === 'ack;';
      this.reset();
    }).catch((error) => {
      this.info += ' -- Error: ' + JSON.stringify(error);
      this.reset();
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
