import { Component } from '@angular/core'
import { IonicPage, NavController, MenuController, Events } from 'ionic-angular'
import { NgForm } from '@angular/forms/'
import { UserDataProvider } from '../../providers/user-data'
import { MyToastProvider } from '../../providers/my-toast'

@IonicPage(
  { name: 'LoginPage' }
)
@Component({
  selector: 'login',
  templateUrl: 'login.html',
})

export class LoginPage {
  login: { phone: string } = { phone: '' }
  submitted = false
  formMessage: string

  constructor(
    public navCtrl: NavController,
    public userData: UserDataProvider,
    private myToast: MyToastProvider,
    private menu: MenuController,
    private events: Events
  ) {
  }

  ionViewDidEnter() {
    // this page will pop from navi by a toolbar's button
    this.menu.enable(false)
  }
  ionViewDidLeave() {
    this.menu.enable(true)
  }

  onLogin(form: NgForm) {
    this.submitted = true
    if (!form.valid) return
    this.userData
      .login(this.login.phone)
      .subscribe(
        () => {
          this.userData.presetData().subscribe()
          this.events.publish('user:login')
          this.myToast.myToast(
            {
              message: 'Đăng nhập thành công',
              duration: 2000,
              cssClass: 'toast-info'
            },
            () => this.navCtrl.pop()
          )
        },
        err => {
          this.formMessage = err.message
        }
      )

  }


}
