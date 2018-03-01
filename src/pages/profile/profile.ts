import { Component } from '@angular/core';
import { IonicPage, MenuController } from 'ionic-angular';

@IonicPage({
  name: 'ProfilePage'
})
@Component({
  selector: 'profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  constructor(
    private menu: MenuController
  ) {
    // this page will pop from navi by a toolbar's button
  }

  ionViewDidEnter() {
    // this page will pop from navi by a toolbar's button
    this.menu.enable(false)
  }
  ionViewDidLeave() {
    this.menu.enable(true, 'loggedInMenu')
  }

}
