import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, Tabs } from 'ionic-angular';
import { UserDataProvider } from '../../providers/user-data';
import { MyDbProvider } from '../../providers/my-db';

@IonicPage()
@Component({
  selector: 'tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = 'StorePage'
  tab2Root: any = 'CartPage'
  tab3Root: any = 'ChatPage'
  mySelectedIndex: number
  @ViewChild('tabs') tabs: Tabs
  basketBadge: number
  constructor(
    navParams: NavParams,
    private myUserProvider: UserDataProvider,
    private dataProvider: MyDbProvider,

  ) {
    this.mySelectedIndex = navParams.data.tabIndex || 0
  }

  ionViewDidEnter() {
    this.setBasketBadge()
  }

  setBasketBadge() {
    this.myUserProvider.getPhoneNumber()
      .subscribe(number => {
        if (!number) {
          return
        }
        this.dataProvider.userGetUncheckedBill(number).subscribe(
          value => {
            this.basketBadge = value.length > 0 ? value.length : undefined
          })

      })
  }

}
