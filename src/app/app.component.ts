import { Component, ViewChild } from '@angular/core'
import { Platform, MenuController, Events, NavController } from 'ionic-angular'
import { UserDataProvider } from '../providers/user-data'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { MyToastProvider } from '../providers/my-toast'


export interface PageInterface {
  title: string
  name: string
  icon: string
  logsOut?: boolean
  index?: number
  tabName?: string
  tabComponent?: any
  requireLoggedIn?: boolean
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  appPages: PageInterface[] = [
    { title: 'Cửa hàng', name: 'TabsPage', tabComponent: 'StorePage', index: 0, icon: 'home' },
    { title: 'Giỏ hàng', name: 'TabsPage', tabComponent: 'CartPage', index: 1, icon: 'cart', requireLoggedIn: true },
    { title: 'Hóa đơn', name: 'TabsPage', tabComponent: 'InvoicesPage', index: 2, icon: 'paper', requireLoggedIn: true },
    { title: 'Tin nhắn', name: 'TabsPage', tabComponent: 'ChatPage', index: 3, icon: 'ios-chatbubbles', requireLoggedIn: true },
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
  ) {

    //-----------> very important for preloading userdata
    this.userData.presetData()
      .subscribe(([hasSeenTutorial, hasLoggedIn]) => {
        this.menuTrigger(hasLoggedIn)
        this.rootPage = hasSeenTutorial ? 'TabsPage' : 'IntroPage'
        this.platformReady()
      })
    //--------------> end of the very important
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

    this.events.subscribe('user:logout', () => {
      this.menuTrigger(false)
    })
  }

  openPage(page: PageInterface) {

    if (page.requireLoggedIn === true && !this.userData.hasLoggedIn) {
      //require logged in pages
      this.myToastProvider.myToast({
        message: 'Đăng nhập để vào mục này',
        duration: 2000,
        position: 'bottom',
        cssClass: 'toast-danger',
      })
      this.nav.push('LoginPage')
      return false
    }

    if (this.nav.getActiveChildNavs()[0].name != 'tabs' && this.nav.getActiveChildNavs()[0].name == page.name) {
      // click to current showingPage -> return
      return false
    }

    let params = {}

    if (page.index) {
      params = { tabIndex: page.index }
    }


    if (page.name == 'LoginPage' || page.name == 'ProfilePage') {
      // if click to LoginPage or ProfilePge we use nav.push for future pop navController
      return this.nav.push(page.name).then(() => false)
    }

    if (this.nav.getActiveChildNavs().length && page.index != undefined) {
      // clicked to tabs menu
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

