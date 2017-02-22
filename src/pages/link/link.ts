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

    this.scan().then((result) => {
      this.linkInfo = JSON.stringify(result);
      return this._http.post(Const.API_ENDPOINT + '/api/link/' + result.text, null, {
        headers: headers
      }).toPromise();
    }).then((dev: any) => {
      this.linkInfo = 'Linked with id: ' + dev.id + '!';
      return this._idService.saveToDevice(dev.id);
    }).then(() => {
      this.navCtrl.setRoot(ScanPage);
    }).catch((error) => {
      this.linkInfo = JSON.stringify(error);
    });
  }

  scan(): Promise<any> {
    return BarcodeScanner.scan({
      resultDisplayDuration: 0,
      formats : 'QR_CODE'
    })
  }
}
