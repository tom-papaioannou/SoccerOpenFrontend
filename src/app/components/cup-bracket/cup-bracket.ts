/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CupBracket,
  CupBracketRound,
  CupBracketTeam,
  CupBracketTie,
  CupRoundType
} from '../../models/competition.model';

type BracketSide = 'left' | 'right';

interface BracketRoundView {
  round: CupBracketRound;
  ties: CupBracketTie[];
  roundIndex: number;
}

@Component({
  selector: 'app-cup-bracket',
  imports: [CommonModule],
  templateUrl: './cup-bracket.html',
  styleUrl: './cup-bracket.css'
})
export class CupBracketComponent {
  @Input({ required: true }) bracket!: CupBracket;
  @Input() cupImageUrl: string | null = '/assets/images/trophy-icon.svg';
  @Input() userTeamID: string | null = null;
  @Output() teamSelected = new EventEmitter<string>();

  readonly leftSide: BracketSide = 'left';
  readonly rightSide: BracketSide = 'right';

  private readonly tieHeight = 88;
  private readonly verticalGap = 0;

  get orderedRounds(): CupBracketRound[] {
    return [...(this.bracket?.rounds ?? [])]
      .sort((a, b) => a.roundNumber - b.roundNumber)
      .map(round => ({
        ...round,
        ties: this.orderedTies(round)
      }));
  }

  get leftRounds(): BracketRoundView[] {
    return this.sideRounds('left');
  }

  get rightRounds(): BracketRoundView[] {
    return this.sideRounds('right').reverse();
  }

  get finalRound(): CupBracketRound | null {
    return this.orderedRounds.find(round => this.isFinalRound(round)) ?? null;
  }

  get finalTie(): CupBracketTie | null {
    const finalRound = this.finalRound;
    return finalRound ? this.orderedTies(finalRound)[0] ?? null : null;
  }

  orderedTies(round: CupBracketRound): CupBracketTie[] {
    return [...(round.ties ?? [])].sort((a, b) => a.tieNumber - b.tieNumber);
  }

  hasPreviousRound(roundIndex: number): boolean {
    return roundIndex > 0;
  }

  hasNextSideRound(roundIndex: number): boolean {
    return roundIndex < this.nonFinalRounds.length - 1;
  }

  hasNextBracketRound(roundIndex: number): boolean {
    return roundIndex < this.orderedRounds.length - 1;
  }

  isFinalRound(round: CupBracketRound): boolean {
    return round.roundType === CupRoundType.Final || round.teamCount === 2;
  }

  roundLabel(round: CupBracketRound): string {
    switch (round.roundType) {
      case CupRoundType.RoundOf64:
        return 'Round of 64';
      case CupRoundType.RoundOf32:
        return 'Round of 32';
      case CupRoundType.RoundOf16:
        return 'Round of 16';
      case CupRoundType.QuarterFinal:
        return 'Quarter-finals';
      case CupRoundType.SemiFinal:
        return 'Semi-finals';
      case CupRoundType.Final:
        return 'Final';
      default:
        return `Round of ${round.teamCount}`;
    }
  }

  roundOffset(roundIndex: number): string {
    const step = 2 ** roundIndex;
    return `${((step - 1) * this.verticalUnit) / 2}px`;
  }

  roundGap(roundIndex: number): string {
    const step = 2 ** roundIndex;
    return `${this.verticalUnit * step - this.tieHeight}px`;
  }

  finalOffset(): string {
    return this.nonFinalRounds.length > 0
      ? this.roundOffset(this.nonFinalRounds.length - 1)
      : '0px';
  }

  teamName(team?: CupBracketTeam | null): string {
    return team?.name?.trim() || 'TBD';
  }

  teamInitials(team?: CupBracketTeam | null): string {
    const name = team?.name?.trim();
    if (!name) {
      return '-';
    }

    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');

    return initials || name.slice(0, 1).toUpperCase();
  }

  teamBadgeColor(team?: CupBracketTeam | null): string {
    return team?.badgeColor || '#2563eb';
  }

  isWinner(tie: CupBracketTie, team?: CupBracketTeam | null): boolean {
    return !!tie.winnerTeamID && !!team?.teamID && tie.winnerTeamID === team.teamID;
  }

  isLoser(tie: CupBracketTie, team?: CupBracketTeam | null): boolean {
    return !!tie.winnerTeamID && !!team?.teamID && tie.winnerTeamID !== team.teamID;
  }

  isUserTeam(team?: CupBracketTeam | null): boolean {
    return !!this.userTeamID && !!team?.teamID && team.teamID === this.userTeamID;
  }

  selectTeam(team?: CupBracketTeam | null): void {
    if (team?.teamID) {
      this.teamSelected.emit(team.teamID);
    }
  }

  teamAriaLabel(team?: CupBracketTeam | null): string {
    return team?.teamID ? `Open ${this.teamName(team)} squad` : 'Team to be decided';
  }

  private get verticalUnit(): number {
    return this.tieHeight + this.verticalGap;
  }

  private get nonFinalRounds(): CupBracketRound[] {
    return this.orderedRounds.filter(round => !this.isFinalRound(round));
  }

  private sideRounds(side: BracketSide): BracketRoundView[] {
    return this.nonFinalRounds.map((round, roundIndex) => {
      const ties = this.orderedTies(round);
      const half = Math.ceil(ties.length / 2);

      return {
        round,
        roundIndex,
        ties: side === 'left' ? ties.slice(0, half) : ties.slice(half)
      };
    });
  }
}
