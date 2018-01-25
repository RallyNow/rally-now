import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { UsersProvider } from '../../providers/users/users';
import { Http } from '@angular/http';
import { ORG } from '../../providers/organizations';
import { UserData } from '../../providers/user-data';
import { AngularFireDatabase } from 'angularfire2/database';


@IonicPage()
@Component({
  selector: 'page-interested-organizations',
  templateUrl: 'interested-organizations.html',
})
export class InterestedOrganizationsPage {

  organizations:any = ORG;
  enable:boolean = true;
  count:number= 0 ;
  buttonText:any = "Continue";
  followArray:any = ["5f4231c9-c362-4663-b5fa-8bae8c3831f1", "2f20250a-8cd2-493a-9a4c-3f01c8330a92", "cf89151e-5ab0-4a1a-bb60-95035c089a52",
  "13421842-df20-4ebc-b191-89d0d4fe8094", "5d6ba8d7-ba1e-453c-ad91-a8a5de210100", "178daa51-5731-453b-b9fe-3b31ec93eb28",
  "25109fc7-5c51-4fb7-bf47-d81ec80fa08f", "98c9bc19-dbeb-49cb-9cb5-f744db0738ac", "fd79e7bb-6cea-487b-8a7f-c6f5194b8ec9",
  "6905e335-dfa7-4865-bd98-f32cec4aa340", "0237382c-f9b0-46fa-aab5-6d383f7813e4", "df5d9984-ebfe-423b-8d71-23cc86a16ad9", "26a234ad-ada5-41e5-bcc8-14452bbd528b",
  "b7e8b91a-103a-40eb-b6a0-e2f1a7066008", "acb84ea8-1dca-4e4c-8093-6c04827f2539", "fb68fe1b-0e40-47ce-a0ea-73570ee1d852", "d034ff40-0fde-41f0-9868-330327a0e22d",
  "3d3a6fc4-0a44-4421-a5c6-438ee94e7fa0", "7069eca3-9997-4af5-9e51-03c51b8add68", "801ff562-fe96-43e5-b3d0-1ee19f1c48cc", "651f2dca-957f-43ed-97a5-88efb8b58268",
  "bf833c81-4930-48ed-8e94-8bf0d01fbbe9", "f4e14dbb-4172-4b5a-9558-d82fca5f1f3c", "b50ee250-3d9e-4bd9-877f-66dcf8d3aeb7", "c57d61d4-6f34-4b4a-a10a-f8ade9a8d111",
  "aa06299b-2bc3-4c04-9f8e-7058421a92a0"];
  organizationEndpoint:any = 'following_organizations';
  myrallyID:any;
  

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public http: Http,
    public af:AngularFireDatabase,
    private httpProvider:UsersProvider,
    public userData: UserData
    ) {
      console.log(ORG);
      this.count = this.followArray.length;
      this.buttonText = "Follow (" + this.count + ")";
      console.log(this.followArray);

  }

  ionViewDidLoad() {
    this.getUID();
    console.log('ionViewDidLoad InterestedOrganizationsPage');
  }

  goToHome(){
    this.navCtrl.setRoot(TabsPage);
  }

    toggleAll(){
      console.log(this.count);
      this.organizations.forEach(org => {
          org.selected = this.enable;
          
      });
      
    }

    getState($event, id){ 
      console.log("DOM", $event);
      if($event._value === true){
          this.count++;
          this.buttonText = "Follow (" + this.count + ")";
          console.log(this.count);
          this.followArray.push(id);
          console.log(this.followArray);
      }else{
        this.count--;
        let position = this.followArray.indexOf(id);
        console.log(position);  
        (this.followArray).splice(position, 1);
        console.log(this.followArray); 
        console.log("Count", this.count);
        if (this.count < 1){
          this.buttonText = "Next";

        }else{
          this.buttonText = "Follow (" + this.count + ")";

        }
      }
    }

    followOrganizations(){
        if(this.followArray.length > 0){

          this.followArray.forEach(org => {
              console.log(org);
              this.followOrg(org);
          });
          console.log("You can Follow");
          this.goToHome();
        }else{
          console.log("Just go home");
          this.goToHome();
        }
    }

    followOrg(organizationID){
      this.httpProvider.followOrganization(this.organizationEndpoint, this.myrallyID, organizationID );
    }

    getUID(){ 
      this.userData.getUid().then((uid) => {
        console.log(uid);
         this.af.database.ref('users/'+uid)
          .on('value', snapshot => {
            console.log("Username", snapshot.val());
            this.myrallyID = snapshot.val().apiRallyID;
        
           
          });
      });
    }
 

}
