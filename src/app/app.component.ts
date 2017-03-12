import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { LinkPage } from '../pages/link/link';
import { ScanPage } from '../pages/scan/scan';
import { IdService } from './services/id.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  constructor(public platform: Platform, public menu: MenuController, public _idService: IdService) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();

      this._idService.getId().then((idFromService) => {
        this.goToScanPage();
      }).catch((err) => {
        console.log(err);
        this.goToLinkPage();
      });
    });
  }

  goToLinkPage() {
    this.nav.setRoot(LinkPage);
  }

  goToScanPage() {
    this.nav.setRoot(ScanPage);
  }
}
