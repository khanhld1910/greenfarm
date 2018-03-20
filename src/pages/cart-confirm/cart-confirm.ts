import { Component } from '@angular/core';
import { IonicPage, NavParams, App, NavController } from 'ionic-angular';
import { SingleBill, AddressInfo, TotalBill } from '../../interfaces/bill';
import { UserDataProvider } from '../../providers/user-data';
import { MyDbProvider } from '../../providers/my-db';
import { MyToastProvider } from '../../providers/my-toast';
import { User } from '../../interfaces/user';


@IonicPage({
  name: 'CartConfirmPage'
})
@Component({
  selector: 'cart-confirm',
  templateUrl: 'cart-confirm.html',
})
export class CartConfirmPage {

  cartBills: SingleBill[]
  user: User = {
    phone: '',
    address: undefined
  }
  addressInfoList: AddressInfo[] = []
  confirmAddress: string
  checkedAddressInforID: string
  time: string
  timeDeliver: string
  name: string
  phone: string

  min: string
  max: string

  constructor(
    public navParams: NavParams,
    private userData: UserDataProvider,
    private myDBProvider: MyDbProvider,
    private myToasProvider: MyToastProvider,
    private _app: App,
    private navCtrl: NavController
  ) {
    this.cartBills = this.navParams.get('cart')
  }

  ionViewDidLoad() {
    this.userData
      .getUserAddressInfoList(this.userData.userPhone)
      .subscribe(value => {
        this.addressInfoList = value
      })

    this.userData
      .getUserInfo(this.userData.userPhone)
      .subscribe(user => {
        this.user = user
      })

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

  isAddressChecked(checkedAddressInforID: string) {
    return this.checkedAddressInforID == checkedAddressInforID
  }

  mainAddressChecked() {
    this.checkedAddressInforID = null
    this.confirmAddress = this.user.address
    this.name = this.user.name
    this.phone = this.user.phone
  }

  addressInfoChecked(address: AddressInfo) {
    this.checkedAddressInforID = address.id
    this.confirmAddress = address.address
    this.name = address.name
    this.phone = address.phone
  }

  updateUserInfo() {
    this.navCtrl.push('ProfilePage', { popBack: true })
  }

  addAddress() {
    if (!this.user.address) {
      // user have not updated profile
      this.navCtrl.push('ProfilePage', { popBack: true })
      return false
    }
    this.navCtrl.push('AddressDeliverPage', { editMode: false })
  }

  editAddressInfo(address: AddressInfo) {
    this.navCtrl.push('AddressDeliverPage', { editMode: true, addressInfo: address })
  }


  confirmInvoice() {
    //console.log(this.timeDeliver, deliverTime) 

    let invoice: TotalBill = {
      address: this.confirmAddress,
      deliverTime: this.time,
      morningDeliver: this.timeDeliver == 'morning',
      id: '',
      productName: [],
      name: this.name,
      phone: this.phone,
      status: 1,
      totalCost: this.navParams.get('total'),
      userID: this.user.phone,
      sentTime: this.sentTime(),
      userID_status: this.user.phone + '_1',      
    }
    this
      .myDBProvider
      .sentReqFromCart(
        this.cartBills,
        invoice
      )
      .subscribe(success => {
        this.navCtrl.pop().then(
          () => {
            this.getNav().getActiveChildNavs()[0].select(2)

            this.myToasProvider
              .myToast({
                message: 'Yêu cầu đặt hàng thành công!',
                duration: 3000,
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

  birthdateFormat() {
    return this.userData.dateDisplay(this.user.birthday)
  }


}
