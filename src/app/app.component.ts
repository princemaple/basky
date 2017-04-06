import { Component, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Team, Score, Player } from './entity';

type T = 'L' | 'R';

@Component({
  selector: 'basky-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  teams = {
    L: new BehaviorSubject<Team>({ scores: [], onBenchPlayers: [], onCourtPlayers: [] }),
    R: new BehaviorSubject<Team>({ scores: [], onBenchPlayers: [], onCourtPlayers: [] })
  }

  duration = 1000 * 60 * 30;
  time = { minute: 0, second: 0};

  constructor() {
    let t = this.teams.L.value;
    // t.scores = [
    // {player: {name: 'e'}, points: 2, timestamp: {minute: 1, second: 30}},
    // {player: {name: 'f'}, points: 3, timestamp: {minute: 6, second: 15}}];
    t.onBenchPlayers = [{name: 'f'}, {name: 'g'}];
    t.onCourtPlayers = [{name: 'a'}, {name: 'b'}, {name: 'c'}, {name: 'd'}, {name: 'e'}];
    this.teams.L.next(t);

    t = this.teams.R.value;
    // t.scores = [{player: {name: 't'}, points: 3, timestamp: {minute: 2, second: 0}}];
    t.onBenchPlayers = [{name: 'u'}, {name: 't'}];
    t.onCourtPlayers = [{name: 'z'}, {name: 'y'}, {name: 'x'}, {name: 'w'}, {name: 'v'}];
    this.teams.R.next(t);
  }

  score(t: T, score: Partial<Score>) {
    let team$ = this.teams[t];
    team$.next(
      Object.assign(
        {},
        team$.value,
        {
          scores: [
            ...team$.value.scores,
            { ...score, timestamp: { ...this.time } }
          ]
        }
      )
    );
  }

  subOn(t: T, player: Player) {
    let team$ = this.teams[t];
    let team = team$.value;
    team.onBenchPlayers = team.onBenchPlayers.filter(p => p !== player);
    team.onCourtPlayers.push(player);
    team$.next(team);
  }

  subOff(t: T, player: Player) {
    let team$ = this.teams[t];
    let team = team$.value;
    team.onCourtPlayers = team.onCourtPlayers.filter(p => p !== player);
    team.onBenchPlayers.push(player);
    team$.next(team);
  }

  setTime(which: 'minute' | 'second', value: number) {
    this.time[which] = value;
  }
}
