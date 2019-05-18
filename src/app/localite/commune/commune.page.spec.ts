import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunePage } from './commune.page';

describe('CommunePage', () => {
  let component: CommunePage;
  let fixture: ComponentFixture<CommunePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
