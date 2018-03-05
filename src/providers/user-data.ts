import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage'
import { Events } from 'ionic-angular';
import { MyDbProvider } from './my-db';
import { Observable } from 'rxjs/Rx';
import { User } from '../interfaces/user';

@Injectable()
export class UserDataProvider {

  constructor(
    private storage: Storage,
    private events: Events,
    private db: MyDbProvider
  ) { }

  hasSeenTutorial: boolean
  hasLoggedIn: boolean
  userPhone: string
  address: string
  deliverTime: string
  userProfile: User

  presetData() {
    return Observable.forkJoin(
      // all observablers will set up userdata 
      // in userdata provider for lately use (in it's variables)
      this.checkHasSeenTutorial(),
      this.checkHasLoggedIn(),
      this.getPhoneNumber(),
    )
  }


  checkHasSeenTutorial(): Promise<boolean> {
    return this.storage.get('hasSeenTutorial')
      .then(value => {
        return this.hasSeenTutorial = value === true
      })
  }

  checkHasLoggedIn(): Promise<boolean> {
    return this.storage.get('hasLoggedIn')
      .then(value => {
        return this.hasLoggedIn = value === true
      })
  }

  getPhoneNumber(): Promise<string> {
    return this.storage.get('userPhone')
      .then(value => {
        return this.userPhone = value
      })
  }

  getUserInfo(phone: string) {
    return this.db.getUserInfo(phone)
  }

  logout(): Promise<any> {
    let hasSeenTutorial = this.hasSeenTutorial
    this.userPhone = null
    this.deliverTime = null
    this.hasLoggedIn = false

    return this.storage.clear()
      .then(() => {
        this.storage.set('hasSeenTutorial', hasSeenTutorial)
        this.events.publish('user:logout')
      })
  }

  login(phone: string) {
    // (login without password)
    return Observable.forkJoin(
      this.db.userLogin(phone),
      this.storage.set('hasLoggedIn', true),
      this.storage.set('userPhone', phone),
    )
  }

  getCartBadge() {
    //console.log(this.userPhone)
    return this.db
      .userGetCartBills(this.userPhone)
      .map(array => array.length)
  }

  getCartBills() {
    return this.db
      .userGetCartBills(this.userPhone)
  }

}
