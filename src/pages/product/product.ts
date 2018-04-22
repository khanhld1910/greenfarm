import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Product } from '../../interfaces/products';
import { SingleBill } from '../../interfaces/bill';
import { MyToastProvider } from '../../providers/my-toast';
import { ProductReviewPage } from '../product-review/product-review';
import { UserDataProvider } from '../../providers/user-data';
import { MyDbProvider } from '../../providers/my-db';
import { SmartAudio } from '../../providers/smart-audio';

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
    private myToastProvider: MyToastProvider,
    private modalCtrl: ModalController,
    private userData: UserDataProvider,
    private myDBProvider: MyDbProvider,
    private smartAudio: SmartAudio
  ) {
    this.product = navParams.get('product')
  }

  addToCart() {
    this.smartAudio.play('tap')
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
      unitPrice: this.product.salePrice ? this.product.salePrice : this.product.unitPrice,
      quantity: 1
    }

    let loading = this.myToastProvider.performLoading('đang xử lý ...')
    // day ne

    bill.userID = this.userData.userPhone
    bill.productID_userID = `${bill.productID}_${this.userData.userPhone}`

    this.myDBProvider
      .checkCartHadProduct(bill)
      .first()
      .subscribe(async value => {

        let result = false

        for (var i = 0; i < value.length; i++) {
          result = (value[i].productID == bill.productID)
          if (result) break
        }

        if (result) {
          await loading.dismiss()
          this.myToastProvider.myToast({
            message: 'Sản phẩm đã sẵn có trong giỏ!',
            duration: 1500,
            position: 'top',
            cssClass: 'toast-danger'
          })
          return
        }

        return this.myDBProvider
          .newCartBill(bill)
          .then(async success => {
            await loading.dismiss()
            this.myToastProvider.myToast({
              message: 'Đã thêm sản phẩm vào giỏ hàng!',
              duration: 2000,
              position: 'top',
              cssClass: 'toast-info'
            })
          })
      })
  }

  openReview() {
    this.smartAudio.play('tap')
    let profileModal = this.modalCtrl.create(ProductReviewPage, { product: this.product })
    profileModal.present()

  }

  getAverageRate(product: Product) {
    return this.userData.averageRate(product)
  }



}

