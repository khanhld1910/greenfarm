import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { Product } from '../../interfaces/products';
import { MyDbProvider } from '../../providers/my-db';
import { MyToastProvider } from '../../providers/my-toast';

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
  showedProducts: Product[]
  filterOptions: string
  searchQuery: string

  @ViewChild(Slides) slides: Slides
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private myDBProvider: MyDbProvider,
    private myToastProvider: MyToastProvider
  ) {
    // the first load has no filter
    this.filterOptions = 'all'
  }

  ionViewWillEnter() {
    this.presentData()
  }

  ionViewDidLoad() {
    // preload data
    this.myDBProvider.getSaleProducts()
  }

  filter(filterOptions: string) {
    // set filter
    if (this.filterOptions == filterOptions) {
      return
    }
    this.filterOptions = filterOptions
    // reset searchBar
    this.searchQuery = undefined
    // triggered this ionViewWillEnter
    this.ionViewWillEnter()
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
      this.filteredProducts = value
      this.showedProducts = this.filteredProducts.slice(0, 4)
    })
  }

  presentSaleProducts() {
    this.myDBProvider.getSaleProducts().subscribe(value => {
      this.filteredProducts = value
      this.showedProducts = this.filteredProducts.slice(0, 4)
    })
  }

  presentSearchProducts() {
    this.myDBProvider.getSearchedProducts(this.searchQuery).subscribe(value => {
      console.log(value)
      this.filteredProducts = value
      this.showedProducts = this.filteredProducts.slice(0, 4)
    })
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
    this.navCtrl.push('ProductPage', {'product': _product})
  }


}
