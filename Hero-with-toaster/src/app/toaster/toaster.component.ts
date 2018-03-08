import { Component, OnInit } from '@angular/core';
import { ToasterService } from 'angular5-toaster';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.css']
})
export class ToasterComponent implements OnInit {
  private toasterService: ToasterService;
  constructor(toasterService: ToasterService) {
    this.toasterService = toasterService;
  }

  ngOnInit() {
  }

  popSuccess() {
    this.toasterService.pop('success', 'Success!', 'You have implemented toaster successfully!');
  }

  popError() {
    this.toasterService.pop('error', 'Error!', 'You got an error!');
  }

}
