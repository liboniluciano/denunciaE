import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, ViewController, ToastController } from 'ionic-angular';
import { User } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-item-create',
  templateUrl: 'item-create.html'
})
export class ItemCreatePage {
  @ViewChild('fileInput') fileInput;

  isReadyToSave: boolean;

  item: any;

  form: FormGroup;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, formBuilder: FormBuilder, public camera: Camera, public user: User, public toastCtrl: ToastController) {
    this.form = formBuilder.group({
      picture: [''],
      name: ['', Validators.required],
      description: ['']
    });

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  ionViewDidLoad() {

  }

  getPicture() {
    if (Camera['installed']()) {
      this.camera.getPicture({
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth: 96,
        targetHeight: 96
      }).then((data) => {
        this.form.patchValue({ 'picture': 'data:image/jpg;base64,' + data });
      }, (err) => {
        alert('Unable to take photo');
      })
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  processWebImage(event) {
    let reader = new FileReader();
    reader.onload = (readerEvent) => {

      let imageData = (readerEvent.target as any).result;
      this.form.patchValue({ 'picture': imageData });
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  getProfileImageStyle() {
    return 'url(' + this.form.controls['picture'].value + ')'
  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {
    if (!this.form.valid) { 
      return; 
    }

    // Attempt to login in through our User service
    let request = {
      user_id: this.user._user.user_id,
      picture: this.form.value.picture,
      name: this.form.value.name,
      category: 'default',
      description: this.form.value.description,
      geolocalization: ''
    };

    this.user.addSolicitation(request).subscribe((resp) => {
      this.viewCtrl.dismiss(this.form.value);
      // Unable to sign up
      let toast = this.toastCtrl.create({
        message: 'Solicitação realizada com sucesso!',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    }, (err) => {

      // Unable to sign up
      let toast = this.toastCtrl.create({
        message: 'Não foi possível criar sua solicitação!',
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });

  }
}
