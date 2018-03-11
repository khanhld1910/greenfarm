import { Component, ViewChild } from '@angular/core'
import { IonicPage, NavController, Slides, MenuController } from 'ionic-angular'
import { Storage } from '@ionic/storage'
import { UserDataProvider } from '../../providers/user-data';

@IonicPage({
  name: 'IntroPage'
})
@Component({
  selector: 'introduce',
  templateUrl: 'introduce.html',
})
export class IntroducePage {

  showSkip = true

  @ViewChild('slides') slides: Slides

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public storage: Storage,
    private userData: UserDataProvider
  ) { }

  startApp() {
    let root = this.userData.hasLoggedIn ? 'TabsPage' : 'LoginPage'
    this.navCtrl.setRoot(root).then(() => this.storage.set('hasSeenTutorial', true))
  }

  onSlideChangeStart(slider: Slides) {
    this.showSkip = !slider.isEnd()
  }

  ionViewWillEnter() {
    this.slides.update()
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false)
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true)
  }

}