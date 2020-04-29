import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-relations-membre',
  templateUrl: './relations-membre.component.html',
  styleUrls: ['./relations-membre.component.scss'],
})
export class RelationsMembreComponent implements OnInit {

  constructor(private popoverController: PopoverController, ) { }

  ngOnInit() {}

  async choix(c) {
    await this.popoverController.dismiss(c);
  }
}
