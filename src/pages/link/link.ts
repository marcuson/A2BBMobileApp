import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BarcodeScanner } from 'ionic-native';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'page-link',
  templateUrl: 'link.html'
})
export class LinkPage {
  linkInfo: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private _http: Http) {
  }

  ionViewDidLoad() {
  }

  startLink() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.scan().then((result) => {
      this.linkInfo = JSON.stringify(result);
      return this._http.post('http://192.168.1.2:5001/api/link/' + result.text, null, {
        headers: headers
      }).toPromise();
    }).then(() => {
      this.linkInfo = 'Linked!';
    }).catch((error) => {
      this.linkInfo = JSON.stringify(error);
    });;
  }

  scan(): Promise<any> {
    return BarcodeScanner.scan({
      resultDisplayDuration: 0,
      formats : 'QR_CODE'
    })
  }
}
