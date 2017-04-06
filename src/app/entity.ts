export interface Player {
  name: string;
}

export interface Time {
  minute: number;
  second: number;
}

export interface Score {
  points: number;
  player: Player;
  timestamp: Time;
}

export interface Team {
  scores: Score[];
  onCourtPlayers: Player[];
  onBenchPlayers: Player[];
}
