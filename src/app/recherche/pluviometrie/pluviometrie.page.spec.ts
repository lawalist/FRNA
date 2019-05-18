import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluviometriePage } from './pluviometrie.page';

describe('PluviometriePage', () => {
  let component: PluviometriePage;
  let fixture: ComponentFixture<PluviometriePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PluviometriePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PluviometriePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
