import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { Product } from '../../interfaces/products';
import { SingleBill } from '../../interfaces/bill';

@IonicPage(
  { name: 'ProductPage' }
)
@Component({
  selector: 'product',
  templateUrl: 'product.html',
})
export class ProductPage {

  product: Product
  quantity: number = 1
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events
  ) {
    this.product = navParams.get('product')
    this.quantity = this.product.amount < 1 ? 0 : 1
  }

  quantityChange(value: number) {
    if (value > 0 && this.quantity >= this.product.amount) {
      return
    } else if (value < 0 && this.quantity <= 1) {
      return
    }
    this.quantity += value
  }


  addToCart() {

    let bill: SingleBill = {
      id: '',
      productID: this.product.id,
      status: 0,
      deliverTime: '',
      userID: '',
      // userID will be set on StorePage
      productName: this.product.name,
      unitPrice: this.product.unitPrice,
      quantity: this.quantity,
      cost: this.quantity * this.product.unitPrice
    }   

    this.events.publish('product:addToCart', bill)
  }



}
