import { Component } from '@angular/core'
import { IonicPage, NavController } from 'ionic-angular'
import { NgForm } from '@angular/forms/'
import { UserDataProvider } from '../../providers/user-data'
import { MyToastProvider } from '../../providers/my-toast'

@IonicPage(
  {name: 'LoginPage'}
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
    private myToast: MyToastProvider
  ) {
  }

  onLogin(form: NgForm) {
    this.submitted = true
    if (!form.valid) return
    this.userData.login(this.login.phone)
      .then(res => {
        if (res.isSuccessfull) {
          this.myToast.myToast({
            message: 'Đăng nhập thành công',
            duration: 2000,
            cssClass: 'toast-info'
          }, () => this.navCtrl.setRoot('TabsPage'))
        } else {
          // error or uncorrect phone, password
          this.formMessage = res.message
        }
      })
  }

}
