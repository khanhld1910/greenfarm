import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage'
import { Events } from 'ionic-angular';
import { MyDbProvider } from './my-db';
import { Observable } from 'rxjs/Rx';
import { User } from '../interfaces/user';
import { Product } from '../interfaces/products';

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

  getUserAddressInfoList(phone: string) {
    return this.db.getUserAddressInfoList(phone)
  }

  setUserInfo(user: User) {
    return this.db.setUserInfo(user)
  }

  logout(): Promise<any> {
    let hasSeenTutorial = this.hasSeenTutorial
    this.userPhone = null
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

  getSentBadge() {
    //console.log(this.userPhone)
    return this.db
      .getSentList(this.userPhone)
      .map(array => array.length)
  }

  lessThan10Format(number: number) {
    return number < 10 ? '0' + number : number
  }

  formatUserPhoneForDisplaying(phone: string) {
    let head = phone.slice(0, -6)
    let tail = phone.slice(-3)
    return `${head}***${tail}`
  }

  averageRate(product: Product) {

    let ratings = product['ratings']

    if (!ratings || ratings.length < 1) {
      return 3
    }

    let sum: number = 0
    let num: number = 0
    for (let key in ratings) {
      // skip loop if the property is from prototype
      if (!ratings.hasOwnProperty(key)) continue
      sum += ratings[key].value
      num++
    }
    return (Math.round(sum * 10 / num)) / 10
  }

  timeDisplay(time: string) {
    let date = new Date(time)
    return this.lessThan10Format(date.getDate()) + '/' +
      this.lessThan10Format(date.getMonth() + 1) + '/' +
      this.lessThan10Format(date.getFullYear()) + ', ' +
      this.lessThan10Format(date.getHours()) + ':' +
      this.lessThan10Format(date.getMinutes())
  }

  dateDisplay(time: string) {
    let date = new Date(time)
    return this.lessThan10Format(date.getDate()) + '/' +
      this.lessThan10Format(date.getMonth() + 1) + '/' +
      this.lessThan10Format(date.getFullYear())
  }

  getHotlineNumber() {
    return this.db.getHotline()
  }


}
