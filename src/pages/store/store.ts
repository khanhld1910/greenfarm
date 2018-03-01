import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Events, Loading } from 'ionic-angular';
import { Product } from '../../interfaces/products';
import { MyDbProvider } from '../../providers/my-db';
import { MyToastProvider } from '../../providers/my-toast';
import { UserDataProvider } from '../../providers/user-data';
import { Subscription } from 'rxjs/Subscription';
import { SingleBill } from '../../interfaces/bill';

@IonicPage(
  {
    name: 'StorePage'
  }
)
@Component({
  selector: 'page-store',
  templateUrl: 'store.html',
})

export class StorePage {

  filteredProducts: Product[]
  allProducts: Product[]
  showedProducts: Product[]
  favoriteProductIDs: string[]
  filterOptions: string
  searchQuery: string
  _hasLoggedIn: boolean = false
  loading: Loading

  @ViewChild(Slides) slides: Slides
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private myDBProvider: MyDbProvider,
    private userDataProvider: UserDataProvider,
    private myToastProvider: MyToastProvider,
    private events: Events,
  ) {
    // the first load has no filter
    this.filterOptions = 'all'
    this.loading = this.myToastProvider.performLoading({ message: 'Đang tải dữ liệu...' })
    // preload data
    this.presentData()
    this.listeningToEvents()
  }

  checkLoggedInSubcription(): Subscription {
    return this.userDataProvider.hasLoggedIn().subscribe(value => {
      this._hasLoggedIn = value
    })
  }

  ionViewWillEnter() {
    this.checkLoggedInSubcription()
    this.getFavoriteProductIDs()
    this.dismissLoading(5000)
  }

  dismissLoading(duration: number) {
    setTimeout(() => {
      this.loading.dismiss()
    }, duration)
  }


  filter(filterOptions: string) {
    // set filter
    if (this.filterOptions == filterOptions) {
      return
    }
    this.filterOptions = filterOptions
    // reset searchBar
    this.searchQuery = undefined

    this.presentData()
  }

  slideChanged() {
    this.slides.startAutoplay()
  }

  presentData() {
    // present filtered products & showedProducts
    switch (this.filterOptions) {
      case 'all': {
        this.presentAllProducts()
        break
      }
      case 'favorite': {
        this.presentFavoriteProducts()
        break
      }
      case 'sale': {
        this.presentSaleProducts()
        break
      }
      default: {
        break
      }
    }
  }

  presentAllProducts() {
    this.myDBProvider.getProducts().subscribe(value => {
      this.allProducts = value
      this.filteredProducts = value
      this.showedProducts = this.filteredProducts.slice(0, 4)
    })
  }

  presentSaleProducts() {
    let result = []
    this.allProducts.forEach(product => {
      if (product.saleOff) result.push(product)
    })
    this.filteredProducts = result
    this.showedProducts = this.filteredProducts.slice(0, 4)
  }

  presentFavoriteProducts() {
    let result = []
    let favoriteIDsArrayForLoop = this.favoriteProductIDs
    this.allProducts.forEach(product => {
      for (var i = 0; i < favoriteIDsArrayForLoop.length; i++) {
        if (product.id == favoriteIDsArrayForLoop[i]) {
          result.push(product)
          break;
        }
      }

    })
    this.filteredProducts = result
    this.showedProducts = this.filteredProducts.slice(0, 4)
  }

  presentSearchProducts() {
    let result = []
    this.allProducts.forEach(product => {
      if (this.checkProductWithSearchQuery(product)) result.push(product)
    })
    this.filteredProducts = result
    this.showedProducts = this.filteredProducts.slice(0, 4)
  }

  checkProductWithSearchQuery(product: Product): boolean {
    let name = product.name.toLowerCase()
    let query = this.searchQuery.trim().toLowerCase()
    return (name.includes(query))
  }

  doInfinite(infiniteScroll) {
    let loadedProductsNum = this.showedProducts.length
    let addArray = this.filteredProducts.slice(loadedProductsNum, loadedProductsNum + 2)
    if (addArray.length == 0) {
      //infiniteScroll.enable(false)
      this.myToastProvider.myToast({
        message: 'Đã hết sản phẩm!',
        duration: 1000,
        position: 'bottom',
        showCloseButton: true,
        closeButtonText: 'ok',
        cssClass: 'toast-info'
      }, () => { infiniteScroll.complete() })
    } else {
      this.showedProducts.push.apply(this.showedProducts, addArray)
    }
    setTimeout(() => {
      infiniteScroll.complete()
    }, 500)
  }

  openProduct(_product: Product) {
    this.navCtrl.push('ProductPage', { 'product': _product })
  }

  addToFavorite(productID: string, setFavoriteTo: boolean) {
    let publishInfo = {
      productID: productID,
      setFavoriteTo: setFavoriteTo
    }
    this.events.publish('product:favorite', publishInfo)
  }

  listeningToEvents() {
    this.events.subscribe('product:favorite', publishInfo => {
      let productID: string = publishInfo.productID
      let setFavoriteTo: boolean = publishInfo.setFavoriteTo
      // will be publish from StorePage and ProductPage
      this.userDataProvider.getPhoneNumber()
        .subscribe(phone => {
          this.myDBProvider.setFavoriteProduct(phone, productID, setFavoriteTo)
            .then(() => {
              this.myToastProvider.myToast({
                message: setFavoriteTo ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích',
                duration: 2000,
                position: 'bottom',
                cssClass: 'toast-info'
              })
              if (this.filterOptions == 'favorite') this.presentFavoriteProducts()

            })
        })
    })

    this.events.subscribe('favorite:reload', () => {
      this.checkLoggedInSubcription()
    })

    this.events.subscribe('product:addToCart', singleBill => {
      // check if user has logged in
      if (!this._hasLoggedIn) {
        this.myToastProvider.myToast({
          message: 'Vui lòng đăng nhập để mua hàng!',
          duration: 2000,
          position: 'bottom',
          cssClass: 'toast-danger'
        }, () => {
          this.navCtrl.push('LoginPage')
        })
        return
      }

      if (singleBill.quantity < 1) {
        // san pham het hang
        this.myToastProvider.myToast({
          message: 'Sản phẩm tạm thời chưa có!',
          duration: 2000,
          position: 'bottom',
          cssClass: 'toast-danger'
        })
        return
      }

      this.userDataProvider.getPhoneNumber()
        .subscribe(phone => {
          let userInfo = this.userDataProvider.getUserInfo(phone)
          userInfo.subscribe(user => {
            //console.log(value.address)       
            if (user.address === undefined) {
              // go to cartPage to update user info            
              this.myToastProvider.myToast({
                message: 'Vui lòng cập nhật thông tin giao hàng!',
                duration: 2000,
                position: 'bottom',
                cssClass: 'toast-danger'
              }, () => {
                this.navCtrl.push('ProfilePage')
              })
            } else {
              let bill: SingleBill = singleBill
              // update userID
              bill.userID = phone
              this.loading = this.myToastProvider.performLoading({ message: 'Đang kết nối ...' })
              this.myDBProvider.newBill(bill)
                .then(success => {
                  this.dismissLoading(500)
                  if (success) {
                    this.myToastProvider.myToast({
                      message: 'Đã thêm sản phẩm vào giỏ hàng!',
                      duration: 2000,
                      position: 'bottom',
                      cssClass: 'toast-info'
                    })
                  }
                })
                .catch(reason => {
                  this.dismissLoading(500)
                  this.myToastProvider.myToast({
                    message: 'TThêm vào giỏ không thành công!',
                    duration: 2000,
                    position: 'bottom',
                    cssClass: 'toast-danger'
                  })
                })

            }
          })
        })

    })
  }


  getFavoriteProductIDs() {
    this.userDataProvider.getPhoneNumber()
      .subscribe(phone => {
        this.myDBProvider.getFavoriteProductIDs(phone)
          .subscribe(favArr => {
            this.favoriteProductIDs = []
            for (var i = 0; i < favArr.length; i++) {
              this.favoriteProductIDs.push(favArr[i].id)
            }
          })
      })
  }

  isFavoriteProduct(productID: string): boolean {
    if (!this.favoriteProductIDs) return false
    let result = false
    for (var i = 0; i < this.favoriteProductIDs.length; i++) {
      if (productID == this.favoriteProductIDs[i]) {
        result = true
        break
      }
    }
    return result
  }

  addToCartOpt(product: Product) {

    let bill: SingleBill = {
      id: '',
      // id will be set on DBProvider
      status: 1,
      userID: '',
      // userID will be set on event.subcribe
      productName: product.name,
      unitPrice: product.unitPrice,
      quantity: 1,
      cost: product.unitPrice
    }

    if (product.amount < 1) bill.quantity = 0

    this.events.publish('product:addToCart', bill)
  }








}
