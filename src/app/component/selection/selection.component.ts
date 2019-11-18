import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
})
export class SelectionComponent implements OnInit {

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {}

  async action(action) {
    await this.popoverController.dismiss(action);
  }

}
