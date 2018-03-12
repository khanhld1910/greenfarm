import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { SingleBill } from '../../interfaces/bill';
import { MyDbProvider } from '../../providers/my-db';
import { UserDataProvider } from '../../providers/user-data';
import { MyToastProvider } from '../../providers/my-toast';
import { NgForm } from '@angular/forms';
import { User } from '../../interfaces/user';
import { Product } from '../../interfaces/products';

@IonicPage()
@Component({
  selector: 'cart',
  templateUrl: 'cart.html',
})
export class CartPage {

  cartBills: SingleBill[]
  req: { address: string } = { address: '' }
  time: string
  submitted = false
  userInfo: User
  allProducts: Product[]

  constructor(
    private myDBProvider: MyDbProvider,
    private userData: UserDataProvider,
    private myToasProvider: MyToastProvider,
    private navCtrl: NavController
  ) {
    this.cartBills = []
  }

  ionViewDidLoad() {
    let loading = this.myToasProvider.performLoading('đang tải ...')

    this.myDBProvider
      .userGetCartBills(this.userData.userPhone)
      .subscribe(cartBills => {
        this.cartBills = cartBills
        loading.dismiss()
      })

    this.myDBProvider
      .getProducts()
      .subscribe(value => {
        this.allProducts = value
      })

    this.userData
      .getUserInfo(this.userData.userPhone)
      .first()
      .subscribe(info => {
        this.userInfo = info
        this.req.address = this.userInfo.address[.0] || null
      })

    this.setTimeRange()
    this.time = this.min
  }

  min: string
  max: string
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
      this.min = `${min.getFullYear()}-${this.userData.lessThan10Format(min.getMonth() + 1)}-${this.userData.lessThan10Format(min.getDate())}T14:00`
    } else {
      this.min = `${min.getFullYear()}-${this.userData.lessThan10Format(tomorrow.getMonth() + 1)}-${this.userData.lessThan10Format(tomorrow.getDate())}T08:00`
    }
    this.max = `${max.getFullYear()}-${this.userData.lessThan10Format(max.getMonth() + 1)}-${this.userData.lessThan10Format(max.getDate())}`

  }

  sentTime() {
    let now = new Date()
    return `${now.getFullYear()}-${this.userData.lessThan10Format(now.getMonth() + 1)}-${this.userData.lessThan10Format(now.getDate())}T${this.userData.lessThan10Format(now.getHours())}:${this.userData.lessThan10Format(now.getMinutes())}`
  }

  removeBill(bill: SingleBill) {
    this.myDBProvider
      .removeCardBill(bill)
  }

  confirmInvoice(form: NgForm) {
    this.submitted = true
    if (!form.valid) return

    let reqBills = []

    for (let i = 0; i < this.cartBills.length; i++) {
      if (this.cartBills[i].quantity > 0) {
        reqBills.push(this.cartBills[i])
      }
    }

    if (!this.userInfo.address) {
      // update address to profile
      this.myDBProvider.updateUserInfo({
        phone: this.userData.userPhone,
        address: [this.req.address]
      })
      console.log(this.req.address)
    }

    this
      .myDBProvider
      .sentReqFromCart(
        reqBills,
        this.userData.userPhone,
        this.time,
        this.sentTime(),
        this.getTotalCost(),
        this.req.address
      )
      .subscribe(success => {
        this.myToasProvider
          .myToast({
            message: 'Yêu cầu đặt hàng thành công!',
            duration: 1500,
            position: 'top',
            cssClass: 'toast-info'
          }, () => {
            this.cartBills = []
          })
      })

  }

  getTotalCost() {
    let total = 0
    for (let i = 0; i < this.cartBills.length; i++) {
      let bill = this.cartBills[i]
      total += bill.unitPrice * bill.quantity
    }
    return total
  }

  quantityChange(indexInArray: number, value: number) {
    let thisProductAmount = 0
    let bill = this.cartBills[indexInArray]

    for (let i = 0; i < this.allProducts.length; i++) {
      let productI = this.allProducts[i]
      if (bill.productID == productI.id) {
        thisProductAmount = productI.amount
        break
      }
    }

    let y = this.cartBills[indexInArray] // alias 

    if (value > 0 && y.quantity == thisProductAmount) {
      // do nothing
    } else if (value < 0 && y.quantity == 1) {
      // do nothing
    } else {
      y.quantity = +y.quantity + +value
      //console.log(y.quantity, value)
    }
  }

  goConfirmCart() {
    if (this.cartBills.length < 1) {
      this.myToasProvider.myToast({
        message: 'Chưa có sản phẩm trong giỏ hàng!',
        duration: 1000,
        cssClass: 'toast-danger',
        position: 'top'
      })
      return
    }
    this.navCtrl.push('CartConfirmPage', {'cart': this.cartBills})
  }

}
