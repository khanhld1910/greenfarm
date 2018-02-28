import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Events } from 'ionic-angular';
import { Product } from '../../interfaces/products';
import { MyDbProvider } from '../../providers/my-db';
import { MyToastProvider } from '../../providers/my-toast';
import { UserDataProvider } from '../../providers/user-data';

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
  }

  ionViewDidLoad() {
    // preload data
    this.myDBProvider.getSaleProducts()
    this.checkHasLoggedIn()
    this.presentData()
    this.listeningToEvents()
    this.getFavoriteProductIDs()
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
        .then(phone => {
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
  }

  _hasLoggedIn: boolean = false
  checkHasLoggedIn(): void {
    this.userDataProvider.hasLoggedIn().then(value => this._hasLoggedIn = value === true)
  }

  getFavoriteProductIDs() {
    this.userDataProvider.getPhoneNumber()
      .then(phone => {
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








}
