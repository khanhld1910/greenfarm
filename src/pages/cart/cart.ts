import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
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
  totalCost: number
  req: { address: string } = { address: '' }
  time: string
  submitted = false
  formMessage: string
  userInfo: User
  allProducts: Product[]

  constructor(
    private myDBProvider: MyDbProvider,
    private userData: UserDataProvider,
    private myToasProvider: MyToastProvider
  ) {
  }

  ionViewDidLoad() {
    let loading = this.myToasProvider.performLoading('đang tải ...')

    this.myDBProvider
      .userGetCartBills(this.userData.userPhone)
      .subscribe(cartBills => {
        this.cartBills = cartBills
        this.totalCost = 0
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
        this.req.address = this.userInfo.address || null
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
      this.min = `${min.getFullYear()}-${this.lessThan10Format(min.getMonth() + 1)}-${this.lessThan10Format(min.getDate())}T14:00`
    } else {
      this.min = `${min.getFullYear()}-${this.lessThan10Format(tomorrow.getMonth() + 1)}-${this.lessThan10Format(tomorrow.getDate())}T08:00`
    }
    this.max = `${max.getFullYear()}-${this.lessThan10Format(max.getMonth() + 1)}-${this.lessThan10Format(max.getDate())}`

  }

  sentTime() {
    let now = new Date()
    return `${now.getFullYear()}-${this.lessThan10Format(now.getMonth() + 1)}-${this.lessThan10Format(now.getDate())}T${this.lessThan10Format(now.getHours())}:${this.lessThan10Format(now.getMinutes())}`
  }

  lessThan10Format(number: number) {
    return number < 10 ? '0' + number : number
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

    if (reqBills.length == 0) {
      this.myToasProvider
        .myToast({
          message: 'Vui lòng chọn số lượng sản phẩm',
          duration: 1500,
          position: 'button',
          cssClass: 'toast-danger'
        })
      return
    }

    if (!this.userInfo.address) {
      // update address to profile
      this.myDBProvider.updateUserInfo({
        phone: this.userData.userPhone,
        address: this.req.address
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
        this.totalCost,
        this.req.address
      )
      .subscribe(success => {
        this.myToasProvider
          .myToast({
            message: 'Yêu cầu đặt hàng thành công!',
            duration: 1500,
            position: 'button',
            cssClass: 'toast-primary'
          }, () => {
            this.totalCost = 0
            this.cartBills = []
          })
      })

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
    } else if (value < 0 && y.quantity == 0) {
      // do nothing
    } else {
      y.quantity = +y.quantity + +value
      this.totalCost = +this.totalCost + +value * y.unitPrice
      //console.log(y.quantity, value)
    }
  }

}
