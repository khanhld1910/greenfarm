import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Events, Loading } from 'ionic-angular';
import { Product } from '../../interfaces/products';
import { MyDbProvider } from '../../providers/my-db';
import { MyToastProvider } from '../../providers/my-toast';
import { UserDataProvider } from '../../providers/user-data';
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
  loading: Loading

  @ViewChild(Slides) slides: Slides
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private myDBProvider: MyDbProvider,
    private userData: UserDataProvider,
    private myToastProvider: MyToastProvider,
    private events: Events
  ) {
    // the first load has no filter
    this.filterOptions = 'all'
    this.loading = this.myToastProvider.performLoading('Đang tải dữ liệu...')
    // preload data ( can be put in IonViewDidEnter event)
    this.presentData()
    this.listeningToEvents()
  }

  ionViewWillEnter() {
    this.getFavoriteProductIDs()
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
    this.myDBProvider
      .getProducts()
      .subscribe(value => {
        this.allProducts = value
        this.filteredProducts = value
        this.showedProducts = this.filteredProducts.slice(0, 6)
      })
  }

  presentSaleProducts() {
    let result = []
    this.allProducts.forEach(product => {
      if (product.saleOff) result.push(product)
    })
    this.filteredProducts = result
    this.showedProducts = this.filteredProducts.slice(0, 6)
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
    this.showedProducts = this.filteredProducts.slice(0, 6)
  }

  checkProductWithSearchQuery(product: Product): boolean {
    let name = product.name.toLowerCase()
    let query = this.searchQuery.trim().toLowerCase()
    return (name.includes(query))
  }

  doInfinite(infiniteScroll) {
    let loadedProductsNum = this.showedProducts.length
    let addArray = this.filteredProducts.slice(loadedProductsNum, loadedProductsNum + 4)
    if (addArray.length == 0) {
      //infiniteScroll.enable(false)
      this.myToastProvider.myToast({
        message: 'Đã hết sản phẩm!',
        duration: 1000,
        position: 'top',
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
      this.myDBProvider.setFavoriteProduct(this.userData.userPhone, productID, setFavoriteTo)
        .then(() => {
          this.myToastProvider.myToast({
            message: setFavoriteTo ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích',
            duration: 1000,
            position: 'top',
            cssClass: 'toast-primary'
          })
          if (this.filterOptions == 'favorite') this.presentFavoriteProducts()

        })
    })

    this.events.subscribe('product:addToCart', (singleBill) =>  {
      let loading = this.myToastProvider.performLoading('đang xử lý ...')
      let bill: SingleBill = singleBill
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
              duration: 1000,
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
                duration: 1000,
                position: 'top',
                cssClass: 'toast-info'
              })
            })

        })
    })
  }

  getFavoriteProductIDs() {
    this.myDBProvider
      .getFavoriteProductIDs(this.userData.userPhone)
      .subscribe(favArr => {
        this.favoriteProductIDs = []
        for (var i = 0; i < favArr.length; i++) {
          this.favoriteProductIDs.push(favArr[i].id)
        }
        this.dismissLoading(500)
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
    if (product.amount == 0) {
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
      // id will be set on DBProvider
      productID: product.id,
      totalBillID: '',
      userID: '',
      // userID will be set on event.subcribe
      productName: product.name,
      unitPrice: product.unitPrice,
      quantity: 1,
      productID_userID: ''
    }
    this.events.publish('product:addToCart', bill)
  }

  getAverageRate(product: Product) {
    return this.userData.averageRate(product)
  }

}
