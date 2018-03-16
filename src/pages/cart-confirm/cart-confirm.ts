import { Component } from '@angular/core';
import { IonicPage, NavParams, ModalController, App, NavController } from 'ionic-angular';
import { SingleBill } from '../../interfaces/bill';
import { UserDataProvider } from '../../providers/user-data';
import { AddressModalPage } from '../address-modal/address-modal';
import { MyDbProvider } from '../../providers/my-db';
import { MyToastProvider } from '../../providers/my-toast';


@IonicPage({
  name: 'CartConfirmPage'
})
@Component({
  selector: 'cart-confirm',
  templateUrl: 'cart-confirm.html',
})
export class CartConfirmPage {

  cartBills: SingleBill[]
  addresses: string[] = []
  addressSelectedIndex: number = 0
  time: string
  timeDeliver: string

  min: string
  max: string

  constructor(
    public navParams: NavParams,
    private userData: UserDataProvider,
    private modalCtrl: ModalController,
    private myDBProvider: MyDbProvider,
    private myToasProvider: MyToastProvider,
    private _app: App,
    private navCtrl: NavController
  ) {
    this.cartBills = this.navParams.get('cart')
  }

  ionViewDidLoad() {
    this.userData
      .getUserAddresses(this.userData.userPhone)
      .subscribe(value => this.addresses = value)


    this.setTimeRange()
    this.time = this.min
  }

  setTimeRange() {
    let now = new Date()
    let nowUnix = now.getTime()

    let tomorrowUnix = nowUnix + 1 * 24 * 60 * 60 * 1000
    let tomorrow = new Date(tomorrowUnix)

    let minUnix = nowUnix + 5 * 60 * 60 * 1000 // for 5 hours after this time
    let maxUnix = nowUnix + 7 * 24 * 60 * 60 * 1000 // for 7 days after this time

    let min = new Date(minUnix)
    let max = new Date(maxUnix)

    if (now.getHours() < 11) {
      this.min = `${min.getFullYear()}-${this.userData.lessThan10Format(min.getMonth() + 1)}-${this.userData.lessThan10Format(min.getDate())}`
      this.timeDeliver = (now.getHours() < 8) ? 'morning' : 'afternoon'
    } else {
      this.min = `${min.getFullYear()}-${this.userData.lessThan10Format(tomorrow.getMonth() + 1)}-${this.userData.lessThan10Format(tomorrow.getDate())}`
      this.timeDeliver = 'morning'
    }
    this.max = `${max.getFullYear()}-${this.userData.lessThan10Format(max.getMonth() + 1)}-${this.userData.lessThan10Format(max.getDate())}`

  }

  sentTime() {
    let now = new Date()
    return `${now.getFullYear()}-${this.userData.lessThan10Format(now.getMonth() + 1)}-${this.userData.lessThan10Format(now.getDate())}T${this.userData.lessThan10Format(now.getHours())}:${this.userData.lessThan10Format(now.getMinutes())}`
  }

  isAddressChecked(addressIndex: number) {
    return this.addressSelectedIndex == addressIndex
  }

  setCheckedIndex(index: number) {
    this.addressSelectedIndex = index
  }

  addressModal(index?: number) {
    //console.log(index)

    let addressModal

    if (!index || index < 0) {
      // new address
      addressModal = this.modalCtrl.create(AddressModalPage, { isEdit: false })
    } else {
      // edit address
      console.log(index)
      addressModal = this.modalCtrl.create(AddressModalPage, { isEdit: true, index: index, addresses: this.addresses });
    }

    addressModal.present()
  }


  confirmInvoice() {
    //console.log(this.timeDeliver, deliverTime)    

    this
      .myDBProvider
      .sentReqFromCart(
        this.cartBills,
        this.userData.userPhone,
        this.time,
        this.timeDeliver == 'morning',
        this.sentTime(),
        this.navParams.get('total'),
        this.addresses[this.addressSelectedIndex]
      )
      .subscribe(success => {
        this.navCtrl.pop().then(
          () => {
            this.getNav().getActiveChildNavs()[0].select(2)

            this.myToasProvider
              .myToast({
                message: 'Yêu cầu đặt hàng thành công!',
                duration: 1000,
                position: 'top',
                cssClass: 'toast-info'
              })
          }
        )
      })

  }

  getNav() {
    let navs = this._app.getRootNavs()
    if (navs && navs.length > 0) {
      return navs[0]
    }
    return this._app.getActiveNavs('content')
  }


}
