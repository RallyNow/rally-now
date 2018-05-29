import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ModalController,
    PopoverController,
    ToastController,
    ActionSheetController
} from 'ionic-angular';
import {FilterEventsPage} from '../filter-events/filter-events';
import {FeedPage} from '../feed/feed';
import {AlertsPage} from '../alerts/alerts';
import {ProfilePage} from '../profile/profile';
import {OverlayPage} from '../overlay/overlay'
import {UsersProvider} from '../../providers/users/users';
import {EventDetailPage} from '../event-detail/event-detail';
import 'rxjs/add/operator/debounceTime';
import {FormControl} from '@angular/forms';
import {Storage} from '@ionic/storage';
import {SocialShareProvider} from '../../providers/social-share/social-share';
import * as constants from "../../constants/constants";


@IonicPage()
@Component({
    selector: 'page-events-result',
    templateUrl: 'events-result.html',
})
export class EventsResultPage {
    events: any;
    startDate: any;
    endDate: any;
    organizationEndpoint: any = 'following_organizations';
    favEndpoint: any = 'actions';
    likeAction: any = '1e006561-8691-4052-bef8-35cc2dcbd54e';
    shareAction: any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
    testPhoto: any = 'https://c1.staticflickr.com/9/8409/buddyicons/41284017@N08_l.jpg?1369764880#41284017@N08';
    myrallyID: any;
    eventLike: any = 'd5d1b115-dbb6-4894-8935-322c336ae951';
    likeendpoint: any = 'likes';
    disable: boolean = false;


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public popoverCtrl: PopoverController,
        private httpProvider: UsersProvider,
        public storage: Storage,
        public toastCtrl: ToastController,
        private shareProvider: SocialShareProvider,
        public actionSheetCtrl: ActionSheetController) {
        console.log(JSON.stringify(navParams.get('events').events));
        this.events = navParams.get('events').events;
        this.startDate = navParams.get('startDate');
        this.endDate = navParams.get('endDate');
        this.httpProvider.returnRallyUserId().then(user => {
            this.myrallyID = user.apiRallyID;
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad EventsPage');


    }


    goToHome() {
        this.navCtrl.setRoot(FeedPage);
    }

    goToAlerts() {
        this.navCtrl.setRoot(AlertsPage);
    }

    goToProfile() {
        this.navCtrl.setRoot(ProfilePage);
    }

    presentPopover() {
        let popover = this.popoverCtrl.create(OverlayPage);
        popover.present();
    }


    goToEventDetail(eventID) {
        console.log(eventID);
        this.navCtrl.push(EventDetailPage, {
            eventID: eventID
        });
    }


    removeEventFav(recordID) {
        this.httpProvider.removeItem(this.likeendpoint, recordID).subscribe(res => {
            console.log(res);
            this.disable = false;

        }, err => {
            console.log(err);
        });
    }

    findInLoop(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                console.log(el);
                return el == this.myrallyID;

            });

            if (!found) {
                return '#f2f2f2';

            } else {
                return '#296fb7';

            }
        }

    }


    getLikeStatus($event, reference_id, like_type) {
        this.disable = true;
        this.httpProvider.getJsonData(this.likeendpoint + '?reference_id=' + reference_id + '&user_id=' + this.myrallyID).subscribe(
            result => {
                console.log("Aqui", result);

                if (result != "") {
                    this.removeEventFav(result[0].id);
                    $event.srcElement.style.backgroundColor = '#f2f2f2';
                    $event.srcElement.offsetParent.style.backgroundColor = '#f2f2f2';
                    $event.srcElement.lastChild.data--;


                } else {
                    this.addLike(reference_id, like_type);
                    $event.srcElement.style.backgroundColor = '#296fb7';
                    $event.srcElement.offsetParent.style.backgroundColor = '#296fb7';
                    $event.srcElement.lastChild.data++;

                }
            },
            err => {
                console.error("Error : " + err);
            },
            () => {
                console.log('getData completed');
            }
        );
    }

    addLike(reference_id, like_type) {
        this.httpProvider.addLike(this.likeendpoint, reference_id, this.myrallyID, like_type).subscribe(
            response => {
                console.log(response);
                this.disable = false;
            });

    }

    shareController(title, imgURI, reference_id, like_type, $event) {
        this.disable = true;
        this.shareProvider.otherShare(title, 'MESSAGE ---', imgURI, constants.appStoreUrl)
            .then(() => {
                this.disable = false;
            }, err => {
                console.log(err);
                this.disable = false;
            })
    }

    addShareAction(goal_id, action_type_id) {
        this.httpProvider.addLike(this.favEndpoint, goal_id, action_type_id, this.myrallyID);
    }

    getDay(day) {
        var d = new Date(day);
        var weekday = new Array(7);
        weekday[0] = "SUNDAY";
        weekday[1] = "MONDAY";
        weekday[2] = "TUESDAY";
        weekday[3] = "WEDNESDAY";
        weekday[4] = "THURSDAY";
        weekday[5] = "FRIDAY";
        weekday[6] = "SATURDAY";
        var n = weekday[d.getDay()];
        return n;
    }

    eventEllipsisController(name, orgID, followers, notify, title, imgURI) {
        this.disable = true;
        const actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Share this event via...',
                    handler: () => {
                        console.log("test");
                        this.shareProvider.otherShare(title, 'MESSAGE ---', imgURI, constants.appStoreUrl)
                            .then(() => {
                                this.disable = false;
                            }, err => {
                                console.log(err);
                                this.disable = false;
                            })
                    }
                },
                {
                    text: this.notifyExist(notify) + name,
                    handler: () => {
                        console.log("test");
                        this.checkNotifiers(orgID);
                        this.disable = false;
                    }
                },
                {
                    text: this.getOrganizationFollowStatus(followers) + ' ' + name,
                    handler: () => {
                        this.orgStatus(orgID);
                        console.log("test");
                        this.disable = false;
                    }
                },
                {
                    text: 'Report',
                    role: 'destructive',
                    handler: () => {
                        console.log("test");
                        this.disable = false;
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                        this.disable = false;
                    }
                }
            ]
        });

        actionSheet.present();
    }

    notifyExist(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el == this.myrallyID;

            });

            if (!found) {
                return 'Turn on notifications for ';

            } else {
                return 'Turn off notifications for ';

            }
        }
    }

    checkNotifiers(orgID) {
        this.httpProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myrallyID + '&organization_id=' + orgID)
            .subscribe(result => {
                console.log("Notifications", result);
                if (result != "") {
                    console.log(result[0].enable_notifications);
                    if (result[0].enable_notifications == true) {
                        this.httpProvider.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: false}));
                    } else {
                        this.httpProvider.updateSingleItem(this.organizationEndpoint + '/' + result[0].id, JSON.stringify({enable_notifications: true}));
                    }
                }
            });
    }

    getOrganizationFollowStatus(actions) {
        if (actions != null) {
            var found = actions.some(el => {
                return el.id == this.myrallyID;
            });

            if (!found) {
                return 'Follow';

            } else {
                return 'Following';
            }
        }
    }

    orgStatus(orgID) {
        this.httpProvider.getJsonData(this.organizationEndpoint + '?follower_id=' + this.myrallyID + '&organization_id=' + orgID).subscribe(
            result => {
                if (result != "") {
                    this.unfollowOrg(result[0].id, orgID);
                    console.log("Unfollow");
                } else {
                    console.log("Follow");
                    this.followOrg(orgID);
                }
            },
            err => {
                console.error("Error : " + err);
            },
            () => {
                console.log('getData completed');
            });
    }


    unfollowOrg(recordID, orgID) {

        this.httpProvider.unfollowOrganization(this.organizationEndpoint, recordID);
        this.httpProvider.removeFollowRecordID(orgID, 'organizations');
    }

    followOrg(organizationID) {
        this.httpProvider.followOrganization(this.organizationEndpoint, this.myrallyID, organizationID);

    }
}
