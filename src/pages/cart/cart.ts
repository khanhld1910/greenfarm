import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { SingleBill } from '../../interfaces/bill';
import { MyDbProvider } from '../../providers/my-db';
import { UserDataProvider } from '../../providers/user-data';
import { MyToastProvider } from '../../providers/my-toast';
import { User } from '../../interfaces/user';
import { Product } from '../../interfaces/products';
import { SmartAudio } from '../../providers/smart-audio';

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
  totalCost: number
  useSaved: Boolean = false
  userSaved: number

  constructor(
    private myDBProvider: MyDbProvider,
    private userData: UserDataProvider,
    private myToasProvider: MyToastProvider,
    private navCtrl: NavController,
    private smartAudio: SmartAudio
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

    this.getUserSaved()

  }


  removeBill(bill: SingleBill) {
    this.smartAudio.play('tap')
    this.myDBProvider
      .removeCardBill(bill)
  }

  getTotalCost() {
    let total = 0
    for (let i = 0; i < this.cartBills.length; i++) {
      let bill = this.cartBills[i]
      total += bill.unitPrice * bill.quantity
    }
    this.totalCost = total
    return total
  }
  getShipCost() {
    return this.totalCost >= 50000 ? 0 : 5000
  }

  quantityChange(indexInArray: number, value: number) {
    this.smartAudio.play('tap')
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

  getUserSaved() {
    this.userData.getUserSaved().subscribe(value => this.userSaved = value)
  }

  savedCalc() {
    if (!this.useSaved) return 0
    if (this.userSaved > this.totalCost + this.getShipCost()) {
      return this.totalCost + this.getShipCost()
    } else {
      let roundedSaved = Math.floor(this.userSaved/1000)*1000
      return roundedSaved
    }
  }

  goConfirmCart() {
    this.smartAudio.play('tap')
    if (this.cartBills.length < 1) {
      this.myToasProvider.myToast({
        message: 'Chưa có sản phẩm trong giỏ hàng!',
        duration: 1000,
        cssClass: 'toast-danger',
        position: 'top'
      })
      return
    }
    let info = {
      cart: this.cartBills, // danh sach hang
      saved: this.savedCalc(), // tra bang diem tich luy
      ship: this.getShipCost(), // phi van chuyen
      cost: this.getTotalCost() // gia tong san pham
    }
    //console.log(info)
    this.navCtrl.push('CartConfirmPage', info)
  }

}
