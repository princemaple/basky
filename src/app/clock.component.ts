import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'toggleTicking()'
  }
})
export class ClockComponent implements OnInit {
  ticker: Observable<number>;

  @Input() duration: number;

  @Output('second') secondEvent = new EventEmitter<number>();
  @Output('minute') minuteEvent = new EventEmitter<number>();

  ticking = false;
  tickPast = 0;
  tickFrom: number;

  minutesLeft: Observable<number>;
  secondsLeft: Observable<number>;

  ngOnInit() {
    this.ticker =
      Observable.interval(100)
        .filter(() => this.ticking)
        .do(() => {
          let d = new Date().valueOf();
          this.tickPast += d - this.tickFrom;
          this.tickFrom = d;
        })
        .takeWhile(() => this.tickPast - 100 < this.duration)
        .startWith(0)
        .publishReplay(1)
        .refCount();

    this.ticker.map(() =>
      Math.floor(this.tickPast / 1000) % 60
    ).distinctUntilChanged().subscribe(second => {
      this.secondEvent.next(second);
    });

    this.ticker.map(() =>
      Math.floor(this.tickPast / 1000 / 60)
    ).distinctUntilChanged().subscribe(minute => {
      this.minuteEvent.next(minute);
    });

    this.secondsLeft = this.ticker.map(() =>
      Math.ceil((this.duration - this.tickPast) / 1000) % 60
    ).distinctUntilChanged();

    this.minutesLeft = this.ticker.map(() =>
      Math.floor(Math.ceil((this.duration - this.tickPast) / 1000) / 60)
    ).distinctUntilChanged();
  }

  toggleTicking() {
    this.ticking = !this.ticking;
    this.tickFrom = new Date().valueOf();
  }
}
