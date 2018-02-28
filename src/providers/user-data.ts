import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage'
import { Events } from 'ionic-angular';
import { MyDbProvider } from './my-db';

@Injectable()
export class UserDataProvider {

  constructor(
    private storage: Storage,
    private events: Events,
    private db: MyDbProvider
  ) { }

  HAS_LOGGED_IN = 'hasLoggedIn'
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial'
  USER_PHONE = 'userPhone'


  hasSeenTutorial(): Promise<boolean> {
    return this.storage.get(this.HAS_SEEN_TUTORIAL).then(value => value === true)
  }

  hasLoggedIn(): Promise<boolean> {
    return this.storage.get(this.HAS_LOGGED_IN)
      .then(value => value === true)
  }


  getPhoneNumber(): Promise<string> {
    return this.storage.get(this.USER_PHONE).then(value => value)
  }

  getUserInfo(phone: string) {
    return this.db.getUserInfo(phone)
  }

  logout(): void {
    this.storage.remove(this.HAS_LOGGED_IN)
    this.storage.remove(this.USER_PHONE)
    this.events.publish('user:logout')
  }

  login(phone: string): Promise<{ isSuccessfull: boolean, message?: string }> {
    // return true if user login is successfull
    // (login without password)
    this.storage.set(this.HAS_LOGGED_IN, true)
    this.storage.set(this.USER_PHONE, phone)

    return this.db.userLogin(phone)
      .then(() => {
        this.events.publish('user:login')
        return {
          isSuccessfull: true,
          message: ''
        }
      }).catch(err => {
        return {
          isSuccessfull: false,
          message: `Lỗi: ${err}`
        }
      })
  }



}
