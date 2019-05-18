import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampPage } from './champ.page';

describe('ChampPage', () => {
  let component: ChampPage;
  let fixture: ComponentFixture<ChampPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChampPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
