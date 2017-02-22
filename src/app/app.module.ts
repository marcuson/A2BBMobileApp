import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { LinkPage } from '../pages/link/link';
import { ScanPage } from '../pages/scan/scan';
import { HttpModule } from '@angular/http';
import { IdService } from './services/id.service';

@NgModule({
  declarations: [
    MyApp,
    LinkPage,
    ScanPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LinkPage,
    ScanPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    IdService
  ]
})
export class AppModule {}
