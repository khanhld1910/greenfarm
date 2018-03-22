import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, App, Content, Loading} from 'ionic-angular';
import { CustomMessage } from '../../interfaces/message';
import { MyDbProvider } from '../../providers/my-db';
import { UserDataProvider } from '../../providers/user-data';
import { MyToastProvider } from '../../providers/my-toast';
import { SmartAudio } from '../../providers/smart-audio';

@IonicPage(
  { name: 'ChatPage' }
)
@Component({
  selector: 'chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  @ViewChild(Content) content: Content

  editorMsg = ''
  showedMessages: CustomMessage[]
  _loading: Loading
  allMessagesLoaded: boolean = false

  constructor(
    public navCtrl: NavController,
    private _app: App,
    private myDBProvider: MyDbProvider,
    private userDataProvider: UserDataProvider,
    private myToast: MyToastProvider,
    private smartAudio: SmartAudio
  ) {
  }


  ionViewDidLoad() {
    this._loading = this.myToast.performLoading('Đang tải dữ liệu ...')
    this.presentFirst5Messages()
  }

  presentFirst5Messages() {
    this.myDBProvider
      .getFirst5Messages(this.userDataProvider.userPhone)
      .subscribe(value => {
        if (!this.showedMessages || this.showedMessages.length == 0) {
          this.showedMessages = value
          this.allMessagesLoaded = (this.showedMessages.length < 5)
        } else {
          let lastReceiveMsg = value.slice(-1)[0]
          let lastShowedMsg = this.showedMessages.slice(-1)[0]
          if (lastReceiveMsg.time != lastShowedMsg.time) this.showedMessages.push(lastReceiveMsg)
        }
        this.scrollToBottom()
        this._loading.dismiss()
      })
  }

  openIntroPage() {
    this.smartAudio.play('tap')
    this._app.getRootNav().setRoot('IntroPage')
  }

  onFocus() {
    this.scrollToBottom()
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom()
      }
    }, 400)
  }

  sendMsg() {
    this.smartAudio.play('tap')
    if (!this.editorMsg.trim()) return

    //create message object
    let message: CustomMessage = {
      content: this.editorMsg,
      sender: 1,
      time: Date.now()
    }

    this.editorMsg = ''

    // send message to database
    this.myDBProvider
      .newMessage(this.userDataProvider.userPhone, message)
      .subscribe()
  }


  viewMore() {
    this.smartAudio.play('tap')
    let oldestMessageHasShowed = this.showedMessages[0]
    this._loading = this.myToast.performLoading('Đang tải ...')
    this.myDBProvider
      .getAnother5Messages(this.userDataProvider.userPhone, oldestMessageHasShowed.time - 1)
      .subscribe(value => {
        if (!value || value.length == 0) {
          this.allMessagesLoaded = true
          this._loading.dismiss()
          return
        }
        Array.prototype.unshift.apply(this.showedMessages, value)
        this._loading.dismiss()
      })


  }

}
