import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, Tabs } from 'ionic-angular';

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
    //private myUserProvider: UserDataProvider,
    //private dataProvider: MyDatabaseProvider,

  ) {
    this.mySelectedIndex = navParams.data.tabIndex || 0
    //this.setBasketBadge()
  }

}
