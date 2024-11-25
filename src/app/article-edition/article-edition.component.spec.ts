import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleEditionComponent } from './article-edition.component';

describe('ArticleEditionComponent', () => {
  let component: ArticleEditionComponent;
  let fixture: ComponentFixture<ArticleEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArticleEditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
