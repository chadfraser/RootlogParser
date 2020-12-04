import { Action } from './actions';

export type Map = 'Fall' | 'Winter' | 'Lake' | 'Mountain';

export type Deck = 'Standard' | 'E&P';

export enum Suit {
  Bird = 'B',
  Fox = 'F',
  Mouse = 'M',
  Rabbit = 'R'
}

export enum Faction {
  Marquise = 'C',
  Eyrie = 'E',
  Woodland = 'A',
  Vagabond = 'V',
  Vagabond2 = 'G',
  Cult = 'L',
  Riverfolk = 'O',
  Duchy = 'D',
  Corvid = 'P'
}

export enum Piece {
  Warrior = 'w',
  Pawn = 'p',
  Building = 'b',
  Token = 't',
  Raft = 'r'
}

export enum Item {
  Sword = 's',
  Bag = 'b',
  Coin = 'c',
  Crossbow = 'x',
  Hammer = 'h',
  Tea = 't',
  Torch = 'r',
  Boot = 'f'
}

export enum ItemState {
  FaceUp = 'r',
  FaceDown = 'e'
}

export enum MarquiseSpecial {
  Sawmill = 'b_s',
  Workshop = 'b_w',
  Recruiter = 'b_r',
  Keep = 't_k',
  Wood = 't'
}

export enum EyrieDecreeColumnSpecial {
  Recruit = 'r',
  Move = 'm',
  Battle = 'x',
  Build = 'b'
}

export enum EyrieLeaderSpecial {
  Builder = 'builder',
  Charismatic = 'charismatic',
  Commander = 'commander',
  Despot = 'despot'
}

export enum WoodlandSpecial {
  FoxBase = 'b_f',
  RabbitBase = 'b_r',
  MouseBase = 'b_m'
}

export enum VagabondItemSpecial {
  Satchel = 's',
  Damaged = 'd',
  Track = 't'
}

export enum VagabondCharacterSpecial {
  Adventurer = 'adventurer',
  Arbiter = 'arbiter',
  Harrier = 'harrier',
  Ranger = 'range',
  Ronin = 'ronin',
  Scoundrel = 'scoundrel',
  Thief = 'thief',
  Tinker = 'tinker',
  Vagrant = 'vagrant'
}

export enum VagabondRelationshipStatus {
  Hostile = 'h',
  Indifferent = '0',
  IndifferentPlusOne = '1',
  IndifferentPlusTwo = '2',
  Allied = 'a'
}

export enum RiverfolkSpecial {
  FoxPost = 't_f',
  RabbitPost = 't_r',
  MousePost = 't_m'
}

export enum RiverfolkPriceSpecial {
  HandCard = 'h',
  Riverboats = 'r',
  Mercenaries = 'm'
}

export enum LizardSpecial {
  FoxGarden = 'b_f',
  RabbitGarden = 'b_r',
  MouseGarden = 'b_m'
}

export enum DuchySpecial {
  Citadel = 'b_c',
  Market = 'b_m',
  Burrow = '0'
}

export enum CorvidSpecial {
  Plot = 't',
  BombPlot = 't_b',
  SnarePlot = 't_s',
  RaidPlot = 't_r',
  ExtortionPlot = 't_e'
}

export enum Card {

  // all decks
  Ambush = 'amb',
  Dominance = 'dom',

  // base deck
  Armorers = 'armor',
  BetterBurrowBank = 'bank',
  BrutalTactics = 'brutal',
  CommandWarren = 'command',
  Cobbler = 'cob',
  Codebreakers = 'codeb',
  FoxFavor = 'favorf',
  MouseFavor = 'favorm',
  RabbitFavor = 'favorr',
  RoyalClaim = 'royal',
  Sappers = 'sap',
  ScoutingParty = 'scout',
  StandAndDeliver = 'stand',
  TaxCollectors = 'tax',

  // exiles and partisans
  BoatBuilders = 'boat',
  CharmOffensive = 'charm',
  CoffinMakers = 'coffin',
  CorvidPlanners = 'cplans',
  EyrieEmigre = 'emi',
  FalseOrders = 'false',
  FoxPartisans = 'fpart',
  RabbitPartisans = 'rpart',
  MousePartisans = 'mpart',
  Informants = 'inform',
  LeagueOfExtraordinaryMice = 'league',
  MasterEngravers = 'engrave',
  MurineBroker = 'murine',
  PropagandaBureau = 'prop',
  Saboteurs = 'sabo',
  SoupKitchens = 'soup',
  SwapMeet = 'swap',
  Tunnels = 'tun'
}

export enum QuestCard {
  Errand = 'errand',
  ExpelBandits = 'bandits',
  FendOffABear = 'bear',
  Escort = 'escort',
  Fundraising = 'funds',
  GiveASpeech = 'speech',
  GuardDuty = 'guard',
  Logistics = 'logs',
  RepairAShed = 'shed'
}

export interface Turn {
  taker: Faction;
  actions: Action[];
}

export interface RootGame {
  
  map: Map;                                     // the map the game takes place on
  deck: Deck;                                   // the deck used for the game
  clearings?: Suit[];                           // the suits for each clearing [1..12] (not necessary for fall, because it has a fixed suit order)
  pool?: Faction[];                             // the faction pool (if using a draft)
  players: Partial<Record<Faction, string>>;    // { [factionkey]: player }
  turns: Turn[];                                // all of the game turns in order
  winner: Faction[];                            // the winner(s) of the game

}