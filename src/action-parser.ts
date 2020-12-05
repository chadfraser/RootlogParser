import { Action, ActionCombat, ActionCraft, ActionDominance, ActionGainVP, ActionLoseVP, ActionMove, ActionReveal, Card, Faction, Item, ItemState, Piece, Suit } from './interfaces';
import { parseConspiracyAction, parseCultAction, parseDuchyAction, parseEyrieAction, parseMarquiseAction, parseRiverfolkAction, parseVagabondAction, parseWoodlandAction } from './parsers';
import { formRegex, ALL_FACTIONS } from './utils/regex-former';

const COMBAT_REGEX = formRegex('[Faction|||attacker]X<Faction|||defender><Clearing|||battleClearing>[<Suit|||defenderAmbush>@[<Suit|||attackerAmbush>@]][(<Roll|||attackerRoll>,<Roll|||defenderRoll>)]');
export const MOVE_REGEX = formRegex('[Number|||countMoved]<Component|||componentMoved>[Location|||origin]->[Location|||destination]');
const MOVE_PIECE_REGEX = formRegex('[Number|||countMoved]<Piece|||pieceMoved>[Location|||origin]->[Location|||destination]');
const MOVE_CARD_REGEX = formRegex('[Number|||countMoved]<Card|||cardMoved>[Location|||origin]->[Location|||destination]');
const MOVE_ITEM_REGEX = formRegex('[Number|||countMoved]<Item|||itemMoved>[Location|||origin]->[Location|||destination]');
const REVEAL_REGEX = formRegex('[Number|||countRevealed][Card|||cardRevealed][Faction|||revealingFaction]\\^[Faction|||revealedFaction]');
// TODO: Group (++|--) messes with literal parens (in roll)
const SCORE_VP_REGEX = formRegex('[Faction|||scoringFaction]\\+\\+|--[Number|||points]');
const CRAFT_REGEX = formRegex('Z<Craftable|||crafted>');
const REMOVE_FACTION_MARKER_REGEX = formRegex('\\+\\+-><FactionBoard|||targetFaction>');  // TODO: https://github.com/AmasaDelano/root-tournaments/wiki/(Rootlog-Example)-Winter-Tournament,-Round-1,-Game-2 uses faction, not faction board
const CLEAR_MOUNTAIN_PATH_REGEX = formRegex('<Clearing|||lowerClearing>_<Clearing|||upperClearing>->');

// parse a VP action, defaults to +1
function parseVP(action: string, currentFaction: Faction): ActionGainVP {
  // [Faction]++[Number]
  const result = action.match(SCORE_VP_REGEX);
  const faction = result.groups.scoringFaction as Faction || currentFaction;
  const count = result.groups.points || 1;
  return { faction: faction, vp: +count };
}

// parse a VP-losing action, defaults to -1
function parseVPReduction(action: string, currentFaction: Faction): ActionLoseVP {
  // [Faction]--[Number]
  const result = action.match(SCORE_VP_REGEX);
  const faction = result.groups.scoringFaction as Faction || currentFaction;
  const count = result.groups.points || 1;
  return { faction: faction, vp: -count };
}

// parse a dominance action
function parseDominance(action: string): ActionDominance {
  // ++-><FactionBoard>
  const result = action.match(REMOVE_FACTION_MARKER_REGEX);
  const target = result.groups.targetFaction as Faction;
  return { target: target };
}

function parseCraft(action: string): ActionCraft {
  // Z<Item|Card>
  const result = action.match(CRAFT_REGEX);
  const crafted = result.groups.crafted;

  // craft an item
  if(crafted[0] === '%') {
    return { craftItem: crafted as Item };
  }

  // craft a card
  return { craftCard: crafted as Card };
}

// parse a combat action
function parseCombat(action: string, takingFaction: Faction): ActionCombat {
  // [Faction]X<Faction><Clearing>[<Suit>@[<Suit>@]][(<Roll>,<Roll>)]
  const result = action.match(COMBAT_REGEX);
  const attacker = result.groups.attacker;
  const defender = result.groups.defender;
  const clearing = result.groups.battleClearing;
  const combat = {
    attacker: (attacker || takingFaction) as Faction,
    defender: defender as Faction,
    clearing: +clearing
  };
  // if (result.groups.defenderAmbush) {
  //   combat.ambush = result.groups.defenderAmbush as Suit;
  // }
  // if (result.groups.attackerAmbush) {
  //   combat.foilAmbush = result.groups.defenderAmbush as Suit;
  // }
  return combat;  
}

// parse a move action
export function parseMove(action: string, takingFaction: Faction): ActionMove {
  // [Number|||countMoved]<Component|||componentMoved>[Location|||origin]->[Location|||destination]
  const result = action.match(COMBAT_REGEX);
  const amountMoved = result.groups.countMoved;
  const thingMoved = result.groups.componentMoved;
  const start = result.groups.origin;
  const end = result.groups.destination;
  return {
    num: +amountMoved,
    thing: thingMoved,
    start: start,
    end: end
  }; // TODO: need to make start/end numbers for clearings?

}


function parseMoveItem(action: string, takingFaction: Faction): ActionMove {


  return null;
}

// parse a reveal action
function parseReveal(action: string, takingFaction: Faction): ActionReveal {
  // [Number][Card][Faction]\\^[Faction]
  const result = action.match(COMBAT_REGEX);
  const amountRevealed = result.groups.countRevealed;
  const cardRevealed = result.groups.cardRevealed;
  const revealingFaction = result.groups.revealingFaction;
  const targetFaction = result.groups.revealedFaction;
  return {
    num: +amountRevealed,
    card: cardRevealed as Card,
    revealer: revealingFaction as Faction,
    target: targetFaction as Faction
  };

}

// parse out an action 
export function parseAction(action: string, faction: Faction): Action {

  if(action.includes('++') && !action.includes('->')) {
    return parseVP(action, faction);
  }

  if(action.includes('--')) {
    return parseVPReduction(action, faction);
  }

  if(action.includes('++') && action.includes('->')) {
    return parseDominance(action);
  }

  if(action.startsWith('Z')) {
    return parseCraft(action);
  }

  if(action.includes('->')) {
    return parseMove(action, faction);
  }

  if(COMBAT_REGEX.test(action)) {
    return parseCombat(action, faction);
  }

  if(REVEAL_REGEX.test(action)) {
    return parseReveal(action, faction);
  }

  // Have to remove so we don't catch, e.g., #despo`t->$` as a token move
  // if(MOVE_ITEM_REGEX.test(action)) {
  //   return parseMoveItem(action, faction);
  // }

  switch(faction) {
    case 'C': return parseMarquiseAction(action);   // Moving a cat building, keep, or wood
    case 'E': return parseEyrieAction(action);      // Adding/removing to the Decree, changing Leader
    case 'A': return parseWoodlandAction(action);   // Moving a base
    case 'V':
    case 'G': return parseVagabondAction(action);   // Quest, updating relationship, moving items on board
    case 'L': return parseCultAction(action);       // Moving a garden, setting outcast/hated
    case 'O': return parseRiverfolkAction(action);  // Moving a trade post, setting prices, updating funds
    case 'D': return parseDuchyAction(action);      // Moving a building, swaying a minister
    case 'P': return parseConspiracyAction(action); // Moving a plot, exposure happening, flipping a plot, tricking
    default: {
      console.error(`Could not parse action: "${action}" (${faction}) - no handlers for this.`);
      // throw new Error(`Could not parse action: "${action}" - no handlers for this.`);
    }
  }

}