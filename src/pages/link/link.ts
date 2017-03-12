import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BarcodeScanner } from 'ionic-native';
import { Http, Headers } from '@angular/http';
import { ScanPage } from '../scan/scan';
import { IdService } from '../../app/services/id.service';
import { Const } from '../../app/const';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'page-link',
  templateUrl: 'link.html'
})
export class LinkPage {
  linkInfo: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private _http: Http, private _idService: IdService) {
  }

  ionViewDidLoad() {
  }

  startLink() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let devId: number;

    this.scan().then((result) => {
      this.linkInfo = 'Temp id read: ' + result.text;
      return this._http.post(Const.API_ENDPOINT + '/api/link/' + result.text, null, {
        headers: headers
      }).toPromise();
    }).then((response) => {
      const resJson = response.json();
      this.linkInfo = 'Device id: ' + resJson.payload.id;
      devId = resJson.payload.id;
      return this._idService.saveToDevice(devId);
    }).then(() => {
      this.linkInfo = 'Linked with id: ' + devId + '!';
      this.navCtrl.setRoot(ScanPage);
    }).catch((error) => {
      this.linkInfo += ' -- Error: ' + JSON.stringify(error);
    });
  }

  scan(): Promise<any> {
    return BarcodeScanner.scan({
      resultDisplayDuration: 0,
      formats : 'QR_CODE'
    })
  }
}
