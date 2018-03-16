import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { MyDbProvider } from '../../providers/my-db';
import { UserDataProvider } from '../../providers/user-data';
import { Rating } from '../../interfaces/rating';
import { MyToastProvider } from '../../providers/my-toast';
import { Product } from '../../interfaces/products';


@Component({
  selector: 'product-review',
  templateUrl: 'product-review.html'
})
export class ProductReviewPage {
  myRating: Rating
  product: Product
  ratings: Rating[]

  constructor(
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private myDBProvider: MyDbProvider,
    private userData: UserDataProvider,
    private toastProvider: MyToastProvider
  ) {
    this.product = this.navParams.get('product')

    this.myRating = {
      productID: this.product.id,
      userID: this.userData.userPhone,
      rate: 3,
      review: ''
    }
  }

  ionViewDidLoad() {
    //console.log(this.productID)
    this.myDBProvider
      .getUserRating(this.userData.userPhone, this.product.id)
      .first()
      .subscribe(rating => this.myRating = rating ? rating : this.myRating)

    this.myDBProvider
      .getAllRatingsOfProduct(this.product.id)
      .subscribe(ratings => this.ratings = ratings)


  }

  dismiss() {
    this.viewCtrl.dismiss()
  }

  rating() {
    this.myDBProvider
      .productRate(this.myRating)
      .then(isSuccess => {

        if (isSuccess) {
          this.toastProvider.myToast({
            message: 'Đã gửi bình luận!',
            cssClass: 'toast-info',
            duration: 1000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'OK'
          })
        } else {
          this.toastProvider.myToast({
            message: 'Có lỗi xảy ra!',
            cssClass: 'toast-danger',
            duration: 1000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'OK'
          })
        }
      })
  }

  checkStar(i: number, rating: number) {
    return (i <= rating)
  }

  setRate(i: number) {
    this.myRating.rate = i
  }

  formatPhoneNumber(phone: string) {
    return this.userData.formatUserPhoneForDisplaying(phone)
  }

  getTime(unixTime: number) {
    let date = new Date(unixTime)
    return this.userData.lessThan10Format(date.getDate()) + '/'
      + this.userData.lessThan10Format(date.getMonth() + 1) + '/'
      + this.userData.lessThan10Format(date.getFullYear())
  }

}
