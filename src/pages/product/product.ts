import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { Product } from '../../interfaces/products';
import { SingleBill } from '../../interfaces/bill';
import { MyToastProvider } from '../../providers/my-toast';

@IonicPage(
  { name: 'ProductPage' }
)
@Component({
  selector: 'product',
  templateUrl: 'product.html',
})
export class ProductPage {

  product: Product
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events,
    private myToastProvider: MyToastProvider
  ) {
    this.product = navParams.get('product')
  }


  addToCart() {

    if (this.product.amount == 0) {
      this.myToastProvider.myToast({
        message: 'Sản phẩm tạm thời chưa có!',
        duration: 1000,
        position: 'bottom',
        cssClass: 'toast-danger'
      })
      return
    }

    let bill: SingleBill = {
      id: '',
      productID: this.product.id,
      userID: '',
      totalBillID: '',
      // userID will be set on StorePage
      productName: this.product.name,
      unitPrice: this.product.unitPrice,
      quantity: 0
    }

    this.events.publish('product:addToCart', bill)
  }



}
