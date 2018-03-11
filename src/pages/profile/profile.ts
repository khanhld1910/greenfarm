import { Component } from '@angular/core';
import { IonicPage, MenuController } from 'ionic-angular';
import { User } from '../../interfaces/user';
import { NgForm } from '@angular/forms';
import { UserDataProvider } from '../../providers/user-data';
import { MyToastProvider } from '../../providers/my-toast';

@IonicPage({
  name: 'ProfilePage'
})
@Component({
  selector: 'profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  user: User
  submitted = false
  formMessage: string

  constructor(
    private menu: MenuController,
    private userDataProvider: UserDataProvider,
    private myToastProvider: MyToastProvider
  ) {
    // this page will pop from navi by a toolbar's button
    this.user = {
      name: '',
      phone: '',
      age: 1,
      isMale: true,
      address: [],
      favorite: [],
    }
  }

  ionViewDidEnter() {
    // this page will pop from navi by a toolbar's button
    this.menu.enable(false)

    this
      .userDataProvider
      .getUserInfo(this.userDataProvider.userPhone)
      .first()
      .subscribe(user => this.user = Object.assign(this.user, user))
  }

  ionViewDidLeave() {
    this.menu.enable(true, 'loggedInMenu')
  }

  updateProfile(form: NgForm) {
    this.submitted = true
    if (!form.valid) return

    this
      .userDataProvider
      .setUserInfo(this.user)      
      .then(() => this.myToastProvider.myToast({
        message: 'đã cập nhật hồ sơ!',
        duration: 1500,
        cssClass: 'toast-primary',
        position: 'top',
        closeButtonText: 'OK',
        showCloseButton: true
      }))
      .catch(err => this.formMessage = err.message)
      
  }

}
