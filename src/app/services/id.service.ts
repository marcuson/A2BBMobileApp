import { Injectable } from '@angular/core';
import { File, RemoveResult } from 'ionic-native';

declare var cordova: any;

@Injectable()
export class IdService {
  private _id: number = null;

  constructor() { }

  getId(): Promise<number> {
    if (this._id !== null) {
      return Promise.resolve(this._id);
    }

    return new Promise((resolve, reject) => {
      File.readAsText(cordova.file.dataDirectory, 'id').then((read) => {
        if (read) {
          this._id = +read;
          resolve(this._id);
        }

        reject('Error loading file with id.');
      }).catch((err) => {
        reject(err);
      });
    });
  }

  saveToDevice(idFromWS: number): Promise<any> {
    return File.writeFile(cordova.file.dataDirectory, 'id', idFromWS.toString());
  }

  delete(): Promise<RemoveResult> {
    this._id = null;
    return File.removeFile(cordova.file.dataDirectory, 'id');
  }
}
