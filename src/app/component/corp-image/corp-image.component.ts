import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import Cropper from 'cropperjs';

//declare var $: any;

@Component({
  selector: 'app-corp-image',
  templateUrl: './corp-image.component.html',
  styleUrls: ['./corp-image.component.scss'],
})
export class CorpImageComponent implements OnInit {
  cropper: any;
  constructor(private navParams: NavParams, private modalCtl: ModalController) {
   }

  ngOnInit() {
    const image = document.getElementById('crop-image') as any;
    if(this.navParams.data.image){
      image.src = this.navParams.data.image;
    }

    this.cropper = new Cropper(image, {
      aspectRatio: 1,
      viewMode: 3,
    });
  }

  async close() {
    this.cropper.destroy();
    this.cropper = null;
    await this.modalCtl.dismiss('close');
  }

  
  async crop() {
    var cropURL;
    //var cropBlob;
    var canvas;
    if (this.cropper) {
      canvas = this.cropper.getCroppedCanvas(/*{
        width: 160,
        height: 160,
      }*/);

      cropURL = canvas.toDataURL('image/jpeg');
      /*canvas.toBlob(function (blob) {
        cropBlob = blob
      });*/
    }
    this.cropper.destroy();
    this.cropper = null;
    await this.modalCtl.dismiss({cropURL: cropURL/*, cropBlob: cropBlob*/});
  }


}
 