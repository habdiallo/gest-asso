import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied-page',
  imports: [RouterLink],
  templateUrl: './access-denied-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDeniedPage {}
