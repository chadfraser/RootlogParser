import { Card, Faction, Item, SpecialLocation, Piece, SpecialPiece, Suit } from './rootgame';

export type Action = ActionGainVP | ActionCraft | ActionMove | ActionDominance | ActionCombat | ActionReveal;

export interface ActionGainVP {
  faction: Faction,
  vp: number;
}

export interface ActionLoseVP {
  faction: Faction,
  vp: number;
}

export interface ActionCraft {
  craftItem?: Item;
  craftCard?: Card;
}

export interface ActionCombat {
  attacker: Faction;
  defender: Faction;
  clearing: number;
  ambush?: Suit;
  foilAmbush?: Suit;
}

export interface ActionMove {
  num: number;
  thing: Card | Item | Piece | SpecialPiece;
  start: number | string | SpecialLocation;
  end: number | string | SpecialLocation;
}

export interface ActionDominance {
  target: Faction;
}

export interface ActionReveal {
  num: number;
  card: Card;
  revealer: Faction;
  target?: Faction;
}