import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { curveMonotoneX } from 'd3-shape';

import { Team, Player, Score } from './entity';

interface PlayerControl extends Player {
  controlOpen: boolean;
}

@Component({
  selector: 'team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent implements OnInit {
  @Input() team: Observable<Team>;
  @Input() minute: number;

  @Output('score') scoreEvent = new EventEmitter<Partial<Score>>();
  @Output('subOn') subOnEvent = new EventEmitter<Player>();
  @Output('subOff') subOffEvent = new EventEmitter<Player>();

  scores: Observable<Score[]>;
  onBenchPlayers: Observable<PlayerControl[]>;
  onCourtPlayers: Observable<PlayerControl[]>;

  totalScore: Observable<number>;
  scoreByMinute: Observable<any>;

  chartOptions = { curve: curveMonotoneX };

  ngOnInit() {
    this.scores = this.team.map(team => team.scores);
    this.onBenchPlayers = this.team.map(team => team.onBenchPlayers);
    this.onCourtPlayers = this.team.map(team => team.onCourtPlayers);

    this.totalScore = this.scores.map(scores =>
      scores.reduce((points, score) => score.points + points, 0)
    );

    this.scoreByMinute =
      this.scores.map(scores => {
        let minuteToScore = scores.reduce((acc, score) => {
          if (!(score.timestamp.minute in acc)) { acc[score.timestamp.minute] = 0; }
          acc[score.timestamp.minute] += score.points;
          return acc;
        }, {});

        let results = [];

        for (let i = 0; i < this.minute + 1; ++i) {
          results.push({ name: i + 1, value: minuteToScore[i] || 0 });
        }

        return [{ series: results, name: 'Scores by minute' }];
      });
  }

  addScore(player: Player, points: number) {
    this.scoreEvent.next({ player, points });
  }

  subOn(player: Player) {
    this.subOnEvent.next(player);
  }

  subOff(player: Player) {
    this.subOffEvent.next(player);
  }

  togglePlayerControl(event: Event, button: Element, player: PlayerControl) {
    if (event.target == button) {
      player.controlOpen = !player.controlOpen;
    } else {
      player.controlOpen = false;
    }
  }
}
