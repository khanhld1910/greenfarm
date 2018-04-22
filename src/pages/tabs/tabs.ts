import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, Tabs } from 'ionic-angular';
import { UserDataProvider } from '../../providers/user-data';
import { SmartAudio } from '../../providers/smart-audio';

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
    private smartAudio: SmartAudio
  ) {
    this.mySelectedIndex = navParams.data.tabIndex || 0

  }

  cartBadge: number = 0
  sentBadge: number = 0
  chatBadge: number = 0
  ionViewDidEnter() {
    setTimeout(() => {
      this.userData
        .getSentBadge()
        .subscribe(value => this.sentBadge = value)

      this.userData
        .getCartBadge()
        .subscribe(value => this.cartBadge = value)


    }, 1000)

    this.userData.getNewestMessage().subscribe(sender => {
      this.userData.getChatBadge().first().subscribe(value => {
        //console.log(sender, value)
        if (sender == 0 && value) {
          this.chatBadge = value          
        } else {
          this.chatBadge = 0
        }
      })    
    })

    
  }

  changeTab() {    
    this.smartAudio.play('tap');
  }


}
