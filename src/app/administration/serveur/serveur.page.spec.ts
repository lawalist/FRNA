import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServeurPage } from './serveur.page';

describe('ServeurPage', () => {
  let component: ServeurPage;
  let fixture: ComponentFixture<ServeurPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServeurPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServeurPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
