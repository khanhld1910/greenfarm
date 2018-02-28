import { Component, ViewChild } from '@angular/core'
import { Platform, MenuController, Events, NavController } from 'ionic-angular'
import { UserDataProvider } from '../providers/user-data'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { MyToastProvider } from '../providers/my-toast'
import { MyDbProvider } from '../providers/my-db';


export interface PageInterface {
  title: string
  name: string
  icon: string
  logsOut?: boolean
  index?: number
  tabName?: string
  tabComponent?: any
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  appPages: PageInterface[] = [
    { title: 'Cửa hàng', name: 'TabsPage', tabComponent: 'StorePage', index: 0, icon: 'home' },
    { title: 'Giỏ hàng', name: 'TabsPage', tabComponent: 'CartPage', index: 1, icon: 'cart' },
    { title: 'Tin nhắn', name: 'TabsPage', tabComponent: 'ChatPage', index: 2, icon: 'chatbubbles' },
  ]

  loggedOutPages: PageInterface[] = [
    { title: 'Đăng nhập', name: 'LoginPage', icon: 'log-in' },
  ]

  loggedInPages: PageInterface[] = [
    { title: 'Hồ sơ', name: 'ProfilePage', icon: 'person' },
    { title: 'Đăng xuất', name: 'TabsPage', icon: 'log-out', logsOut: true }
  ]

  rootPage: any
  @ViewChild('content') nav: NavController
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private userData: UserDataProvider,
    private menu: MenuController,
    private events: Events,
    private myToastProvider: MyToastProvider,
    private myDBProvider: MyDbProvider,
  ) {
    this.userData.hasLoggedIn().then(value => this.menuTrigger(value))

    this.userData.hasSeenTutorial()
      .then(hasSeenTutorial => {
        //console.log(hasSeenTutorial)
        if (!hasSeenTutorial) {
          this.rootPage = 'IntroPage'
        } else {
          this.rootPage = 'TabsPage'
        }
        this.platformReady()
      })

    // load products for storePage
    this.myDBProvider.getProducts()
    this.listenToLoginEvents()
  }

  platformReady() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault()
      this.splashScreen.hide()
    })
  }

  menuTrigger(hasLoggedIn: boolean) {
    this.menu.enable(!hasLoggedIn, 'loggedOutMenu')
    this.menu.enable(hasLoggedIn, 'loggedInMenu')
  }

  listenToLoginEvents() {
    // events will be published by UserData provider
    this.events.subscribe('user:login', () => {
      this.menuTrigger(true)
    })

    this.events.subscribe('user:signup', () => {
      this.menuTrigger(true)
    })

    this.events.subscribe('user:logout', () => {
      this.menuTrigger(false)
    })
  }

  openIntro() {
    this.nav.setRoot('IntroPage')
  }

  openPage(page: PageInterface) {

    let params = {}

    if (page.index) {
      params = { tabIndex: page.index }
    }

    if (this.nav.getActiveChildNavs().length && page.index != undefined) {
      this.nav.getActiveChildNavs()[0].select(page.index)
    } else {
      // Set the root of the nav with params if it's a tab index
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`)
      })
    }

    if (page.logsOut === true) {
      // Give the menu time to close before changing to logged out
      this.userData.logout()
      //this.myToastProvider.myToast(2000, "Đăng xuất thành công", null)
      this.myToastProvider.myToast({
        message: 'Đăng xuất thành công',
        duration: 2000,
        position: 'bottom',
        cssClass: 'toast-info',
        showCloseButton: true,
        closeButtonText: 'Ok'
      })
    }

  }

  isActive(page: PageInterface) {
    let childNav = this.nav.getActiveChildNavs()[0]
    // Tabs are a special case because they have their own navigation
    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return 'primary'
      }
      return
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return 'primary'
    }
    return
  }

}

