import { Component } from '@angular/core';
import { IonicPage, MenuController, NavParams, NavController } from 'ionic-angular';
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
    private myToastProvider: MyToastProvider,
    private navParams: NavParams,
    private navCtrl: NavController
  ) {
    // this page will pop from navi by a toolbar's button
    this.user = {
      name: '',
      phone: '',
      isMale: true,
      address: '',
      favorite: [],
      birthday: '1991-10-19'
    }
  }

  ionViewDidEnter() {
    // this page will pop from navi by a toolbar's button
    this.menu.enable(false)

    this.setBirthdayRange()

    this
      .userDataProvider
      .getUserInfo(this.userDataProvider.userPhone)
      .first()
      .subscribe(user => {
        this.user = Object.assign(this.user, user)

        this.user.birthday = user.birthday || this.max
      })
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
      .then(() => this.myToastProvider.myToast(
        {
          message: 'đã cập nhật hồ sơ!',
          duration: 1500,
          cssClass: 'toast-primary',
          position: 'top',
          closeButtonText: 'OK',
          showCloseButton: true
        },
        () => {
          let popBack: boolean = this.navParams.get('popBack')
          if (popBack) this.navCtrl.pop()
        }
      ))
      .catch(err => this.formMessage = err.message)

  }

  min: string
  max: string
  setBirthdayRange() {
    let now = new Date()
    this.min = `${now.getFullYear() - 60}-01-01` // 01/01// 60 years ago
    this.max = `${now.getFullYear() - 14}-01-01` // 14 years ago in 01/01
  }

}
