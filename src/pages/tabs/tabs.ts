import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, Tabs, NavController } from 'ionic-angular';
import { UserDataProvider } from '../../providers/user-data';
import { MyToastProvider } from '../../providers/my-toast';

@IonicPage()
@Component({
  selector: 'tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = 'StorePage'
  tab2Root: any = 'CartPage'
  tab3Root: any = 'InvoicesPage'
  tab4Root: any = 'ChatPage'
  mySelectedIndex: number
  @ViewChild('tabs') tabs: Tabs
  constructor(
    navParams: NavParams,
    private userData: UserDataProvider,
    private myToastProvider: MyToastProvider,
    private nav: NavController
  ) {
    this.mySelectedIndex = navParams.data.tabIndex || 0

  }

  cartBadge: number = 0
  ionViewDidEnter() {
    setTimeout(() => {
      this.userData
        .getCartBadge()
        .subscribe(value => this.cartBadge = value)
    }, 1000)
  }


}
