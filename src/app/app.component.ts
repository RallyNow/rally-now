import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { UserData } from '../providers/user-data';
import { FeedPage } from '../pages/feed/feed';
import { NotificationProvider } from '../providers/notification/notification';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';
import {UsersProvider} from '../providers/users/users';
import {Push} from '@ionic/cloud-angular';
import { TabsPage } from '../pages/tabs/tabs';
//import { FCM } from '@ionic-native/fcm';
import { Socket } from 'ng-socket-io';


 
@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any;


    constructor(
    	public platform: Platform, 
    	statusBar: StatusBar, 
    	public splashScreen: SplashScreen, 
    	public alertCtrl: AlertController,
    	public userData: UserData,
      noti: NotificationProvider,
      public storage:Storage,
      private httpProvider:UsersProvider,
      public push: Push,
      private socket: Socket
      //private fcm: FCM
    	) {
        console.log(this.socket);
       this.userData.hasLoggedIn().then((hasLoggedIn) => {
      
                if(hasLoggedIn){
                  this.rootPage = TabsPage;
                }
                else{
                  this.rootPage = HomePage;
                  

                }
        }); 
          platform.ready().then((readySource) => {
            this.socket.connect();
            // var message:any = [{'action':'getMessages','uid':'1dcd32f2-745e-4b9c-8072-3f702d8b0415'}]
            // message = JSON.stringify(message);
            // this.socket.emit(message);
            this.socket.on('message', function(tweet){
                console.log(tweet);
            });


            console.log("Platform Ready from ", readySource);
            statusBar.overlaysWebView(false);

            statusBar.backgroundColorByHexString('#f4512c');
          firebase.auth().onAuthStateChanged(user => {
            if (user) {
               this.storage.get('introShown').then((result) => {
               if (result) {
                 console.log('Not First Time');
               }else{
                 this.httpProvider.returnRallyUserId()
                   .then(user => {
                     console.log("Usuario desde Notificaciones", user.apiRallyID);
                     noti.init(user.apiRallyID);

                   });
                 console.log('First Time');
                
                 this.storage.set('introShown', true);

               }
            });
              this.push.rx.notification()
                .subscribe((msg) => {
                 console.log('I received awesome push: ' + msg);
                });
            }else{
              console.log("No estas logueado para notificaciones");
            }
            
          });
         });


            
    }


    
}