import { Injectable } from '@angular/core'
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Product } from '../interfaces/products';
import { User } from '../interfaces/user';

@Injectable()
export class MyDbProvider {

  constructor(
    private afDB: AngularFireDatabase
  ) { }

  public products: Observable<Product[]>
  public saleProducts: Observable<Product[]>

  getProducts(searchQuery?: string): Observable<Product[]> {
    // this function will be called in App.Components.ts for preload data
    if (!this.products) {
      // check if this.getProducts() has called 
      this.products = this.afDB.list<Product>(
        'Products/',
        ref => ref.orderByChild('id')
      ).valueChanges()
    }
    return this.products
  }

  getSaleProducts(): Observable<Product[]> {
    // this function will be called in Store.ts for preload data (ionViewDidLoad())
    if (!this.saleProducts) {
      // check if this.getSaleProducts() has called 
      this.saleProducts = this.afDB.list<Product>(
        'Products/',
        ref => ref.orderByChild('saleOff').equalTo(true)
      ).valueChanges()
    }
    return this.saleProducts
  }

  getSearchedProducts(_query?: string): Observable<Product[]> {
    let query = _query.replace(/\b\w/g, l => l.toUpperCase())
    return this.afDB.list<Product>(
      'Products/',
      ref => ref.orderByChild('name').startAt(query).endAt(query + '\uf8ff')
    ).valueChanges()
  }

  userLogin(phone: string): Promise<void> {
    let userRef = this.afDB.object('Users/' + phone)
    return userRef.update({ phone: phone })
  }

  getUserInfo(phone: string): Observable<User> {
    return this.afDB.object<User>('Users/' + phone).valueChanges()
  }


}
