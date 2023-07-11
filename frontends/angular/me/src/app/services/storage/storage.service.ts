import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: any;

  constructor() {
    this.storage = sessionStorage; // localStorage;
  }


  public retrieve(key: string): any {
    let item = this.storage.getItem(key);

    if (item && item !== 'undefined') {
      return JSON.parse(this.storage.getItem(key));
    }
  }

  
  public store(key: string, value: any) {
    console.log(`--> storing ${key}: ${value}`);
    this.storage.setItem(key, JSON.stringify(value));
  }
}

