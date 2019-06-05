import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BDLocalePage } from './bd-locale.page';

describe('BDLocalePage', () => {
  let component: BDLocalePage;
  let fixture: ComponentFixture<BDLocalePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BDLocalePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BDLocalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
