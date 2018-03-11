import { BrowserModule } from '@angular/platform-browser'
import { ErrorHandler, NgModule } from '@angular/core'
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular'
import { SplashScreen } from '@ionic-native/splash-screen'
import { StatusBar } from '@ionic-native/status-bar'
import { MyApp } from './app.component'
import { UserDataProvider } from '../providers/user-data'
import { IonicStorageModule } from '@ionic/storage'
// angularfire2 config and imports
import { AngularFireModule } from 'angularfire2'
import { firebaseConfig } from '../environment'
import { AngularFireDatabaseModule } from 'angularfire2/database'
import { MyToastProvider } from '../providers/my-toast';
import { MyDbProvider } from '../providers/my-db';
import { ProductReviewPage } from '../pages/product-review/product-review';
import { TimesPipe } from '../pipes/custom-loop';


@NgModule({
  declarations: [
    MyApp,
    ProductReviewPage,
    TimesPipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ProductReviewPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    UserDataProvider,
    MyToastProvider,
    MyDbProvider,
    TimesPipe
  ]
})
export class AppModule { }
