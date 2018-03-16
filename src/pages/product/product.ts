import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ModalController } from 'ionic-angular';
import { Product } from '../../interfaces/products';
import { SingleBill } from '../../interfaces/bill';
import { MyToastProvider } from '../../providers/my-toast';
import { ProductReviewPage } from '../product-review/product-review';
import { UserDataProvider } from '../../providers/user-data';

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
    private myToastProvider: MyToastProvider,
    private modalCtrl: ModalController,
    private userData: UserDataProvider
  ) {
    this.product = navParams.get('product')
  }

  addToCart() {
    // trang chi tiet
    if (this.product.amount == 0) {
      
      this.myToastProvider.myToast({
        message: 'Sản phẩm tạm thời hết hàng!',
        duration: 1000,
        position: 'top',
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
      quantity: 1
    }

    this.events.publish('product:addToCart', bill)
  }

  openReview() {
    let profileModal = this.modalCtrl.create(ProductReviewPage, { product: this.product })
    profileModal.present()
    
  }

  getAverageRate(product: Product) {
    return this.userData.averageRate(product)
  }



}

