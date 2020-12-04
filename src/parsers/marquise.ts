import { Action, ActionMove, MarquiseSpecial } from '../interfaces';
import { formRegex } from '../utils/regex-former';

const MARQUISE_MOVE_PIECE_REGEX = formRegex('[Number]<MarquisePiece>[Location]->[Location]');

/**
 * #despot->$  matches [token -> $] so be careful!
 * 
 * t_k->2       Keep [from board] to clearing 2
 * b_w->2       Workshop [from board] to clearing 2
 * b_s+b_r->10  Sawmill + Recruiter [from board] to clearing 10
 * w->2+3+4+5+6+7+8+9+10+11+12  Warrior [from board] to clearings 2, 3, ..., 12
 * t->10        Wood [from board] to clearing 10
 * w5->11       Warrior from clearing 5 to clearing 11
 * w8->10       Warrior from clearing 8 to clearing 10
 * t10->        Wood from clearing 10 [to board]
 * b_r->11      Recruiter [from board] to clearing 11
 * XG10         Battle Second Vagabond in clearing 10
 * %rG$->d      Torch item from Second Vagabond board [satchel] to [Second Vagabond] damaged section
 * #->C         Draw a card [to hand]
 * 
 * t->10        Wood [from board] to clearing 10
 * Ztun         Craft Tunnels
 * B#C->        Bird card from Cats [hand] [to discard]
 * M#C->        Mouse card from Cats [hand] [to discard]
 * t->10        Wood [from board] to clearing 10
 * b_s->11      Sawmill [from board] to clearing 11
 * ++           Gain 1 VP
 * b_w->10      Workshop [from board] to clearing 10
 * ++2          Gain 2 VP
 * w->10+11     Warriors [from board] to clearings 10, 11
 * #->C         Draw a card [to hand]
 */

export function parseMarquiseAction(action: string): ActionMove {

  if (action.includes('t_k') && !action.includes('->')) {
    return { num: 0, thing: MarquiseSpecial.Keep, start: 0, end: 0 };
  }

  if (action.includes('t_k') && !action.includes('->')) {
    return { num: 0, thing: MarquiseSpecial.Keep, start: 0, end: 0 };
  }

  if (action.includes('t_k') && !action.includes('->')) {
    return { num: 0, thing: MarquiseSpecial.Keep, start: 0, end: 0 };
  }

  if (action.includes('t_k') && !action.includes('->')) {
    return { num: 0, thing: MarquiseSpecial.Keep, start: 0, end: 0 };
  }

  console.error(`Could not parse Marquise action: "${action}" - no handlers for this.`);
  return null;
}