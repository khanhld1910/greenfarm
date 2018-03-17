import { Component, ViewChild } from '@angular/core'
import { Platform, MenuController, Events, NavController, App } from 'ionic-angular'
import { UserDataProvider } from '../providers/user-data'
import { StatusBar } from '@ionic-native/status-bar'
import { SplashScreen } from '@ionic-native/splash-screen'
import { CallNumber } from '@ionic-native/call-number'
import { MyToastProvider } from '../providers/my-toast'
import { ScreenOrientation } from '@ionic-native/screen-orientation'
import { timer } from 'rxjs/observable/timer';


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
    { title: 'Hóa đơn', name: 'TabsPage', tabComponent: 'InvoicesPage', index: 2, icon: 'paper' },
    { title: 'Tin nhắn', name: 'TabsPage', tabComponent: 'ChatPage', index: 3, icon: 'ios-chatbubbles' },
  ]

  loggedInPages: PageInterface[] = [
    { title: 'Hồ sơ', name: 'ProfilePage', icon: 'person' },
    { title: 'Đăng xuất', name: 'TabsPage', icon: 'log-out', logsOut: true }
  ]

  rootPage: any
  hotline: string
  showSplash: boolean = true
  @ViewChild('content') nav: NavController
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private userData: UserDataProvider,
    private menu: MenuController,
    private events: Events,
    private myToastProvider: MyToastProvider,
    private callNumber: CallNumber,
    private app: App,
    private screenOrientation: ScreenOrientation
  ) {

    //-----------> very important for preloading userdata
    this.userData.presetData()
      .subscribe(([hasSeenTutorial, hasLoggedIn]) => {
        this.menuTrigger(hasLoggedIn)
        if (!hasSeenTutorial) {
          this.rootPage = 'IntroPage'
        } else {
          this.rootPage = hasLoggedIn ? 'TabsPage' : 'LoginPage'
        }
        this.platformReady()
      })
    //--------------> end of the very important
    this.listenToLoginEvents()
    this.getHotline()
  }

  platformReady() {
    this.platform.ready().then(val => {
      this.statusBar.styleDefault()
      this.splashScreen.hide()
      this.setBackButton()
      //console.log(val)
      if (val == 'cordova') {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT)
      }

      timer(3000).subscribe(() => this.showSplash = false) // <-- hide animation after 3s
    })
  }

  getHotline() {
    this.userData
      .getHotlineNumber()
      .first()
      .subscribe(value => this.hotline = value.hotline)
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

    if (this.nav.getActiveChildNavs()[0].name != 'tabs' && this.nav.getActiveChildNavs()[0].name == page.name) {
      // click to current showingPage -> return
      return false
    }

    let params = {}

    if (page.index) {
      params = { tabIndex: page.index }
    }


    if (page.name == 'ProfilePage') {
      // if click to ProfilePge we use nav.push for future pop navController
      return this.nav.push(page.name)
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
      this.userData
        .logout()
        .then(() => this.nav.setRoot('LoginPage'))
      //this.myToastProvider.myToast(2000, "Đăng xuất thành công", null)
      this.myToastProvider.myToast({
        message: 'Đăng xuất thành công',
        duration: 2000,
        position: 'top',
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

  openIntro() {
    this.nav.setRoot('IntroPage')
  }


  call() {
    this.callNumber.callNumber(this.hotline, true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'))
  }

  lastBack: number
  allowClose: boolean
  setBackButton() {
    this.platform.registerBackButtonAction(() => {
      const overlay = this.app._appRoot._overlayPortal.getActive()
      const nav = this.app.getActiveNav()
      const closeDelay = 2000
      const spamDelay = 500

      if (overlay && overlay.dismiss) {
        overlay.dismiss()
      } else if (nav.canGoBack()) {
        nav.pop()
      } else if (Date.now() - this.lastBack > spamDelay && !this.allowClose) {
        this.allowClose = true
        this.myToastProvider.myToast({
          message: 'Nhấn hai lần để thoát ứng dụng',
          duration: closeDelay,
          position: 'top'
        }, () => this.allowClose = false
        )
      } else if (Date.now() - this.lastBack < closeDelay && this.allowClose) {
        this.platform.exitApp()
      }
      this.lastBack = Date.now()
    })
  }




}

