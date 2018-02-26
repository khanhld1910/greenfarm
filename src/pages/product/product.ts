import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Product } from '../../interfaces/products';
import { UserDataProvider } from '../../providers/user-data';
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
  quantity: number = 1
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userProvider: UserDataProvider,
    private myToast: MyToastProvider
  ) {
    this.product = navParams.get('product')
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
    // Check is user already has address
    this.userProvider.hasLoggedIn().then(loggedin => {
      if (!loggedin) {
        this.myToast.myToast({
          message: 'Vui lòng đăng nhập để mua hàng!',
          duration: 2000,
          position: 'top',
          cssClass: 'toast-danger'
        }, () => {
          this.navCtrl.push('LoginPage')
        })
        return
      }
      this.userProvider.getPhoneNumber().then(phone => {
        let userInfo = this.userProvider.getUserInfo(phone)
        userInfo.subscribe(value => {
          //console.log(value.address)       
          if (value.address === undefined) {
            this.myToast.myToast({
              message: 'Vui lòng cập nhật thông tin giao hàng!',
              duration: 2000,
              position: 'top',
              cssClass: 'toast-danger'
            }, () => {
              this.navCtrl.push('ProfilePage')
            })
          } else {
            /*
            //--------------> add to cart 
            let bill: SingleBill = {
              id: '',
              checked: false,
              userID: phone,
              productName: this.product.name,
              unitPrice: this.product.unitPrice,
              quantity: this.quantity,
              cost: this.quantity * this.product.unitPrice
            }
            this.myDBProvider.newUnitBill(bill).then(success => {
              if (success) {
                this.myToast.myToast(3000, 'Sản phẩm đã được thêm vào giỏ', 'bottom')
              }
            })
            */
          }
        })
      })
    })

  }

}
