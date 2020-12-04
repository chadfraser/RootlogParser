import { Card, Faction, Item, ItemState, Piece, Suit, MarquiseSpecial, EyrieDecreeColumnSpecial, EyrieLeaderSpecial, WoodlandSpecial, VagabondItemSpecial, RiverfolkSpecial, LizardSpecial, DuchySpecial, CorvidSpecial } from '../interfaces';

const ALL_FACTIONS = Object.values(Faction).join('') + '#';
const ALL_SUITS = Object.values(Suit).join('');
const ALL_ITEMS = Object.values(Item).join('');
const ALL_PIECE_TYPES = Object.values(Piece).join('');
const ALL_ITEM_STATE = Object.values(ItemState).join('');
const ALL_CARD_NAMES = `(${Object.values(Card).join('|')})`;  // one of the card's codenames, in full
// a card's codename or one of the Eyrie leader's names, in full
// const ALL_CARDS_WITH_SPECIALS = `(${ALL_CARDS}|${Object.values(EyrieLeaderSpecial)})`;

// const ALL_PIECES_WITH_SPECIALS = `(${ALL_PIECES}|${Object.values(MarquiseSpecial).join('|')}\
// |${Object.values(WoodlandSpecial).join('|')}|${Object.values(RiverfolkSpecial).join('|')}\
// |${Object.values(LizardSpecial).join('|')}|${Object.values(DuchySpecial).join('|')}\
// |${Object.values(CorvidSpecial).join('|')})`

const CLEARING = '(1[0-2]|[1-9])'; // a number from 1-12
const FOREST = `${CLEARING}(_${CLEARING}){2,}`;  // 3+ adjacent clearings, separated by underscores
const FACTION_BOARD = `(${ALL_FACTIONS})?\$`;  // $, optionally preceeded by a faction's character code 
const HAND = `${ALL_FACTIONS}`;  // The faction's character code
const EYRIE_DECREE_COLUMN =  `(${Object.values(EyrieDecreeColumnSpecial).join('|')})`;  // r, m, x, b, for cards in the Decree
const VAGABOND_BOARD_AREAS = `[${Object.values(VagabondItemSpecial).join('')}]`;  // s, d, or t, for items (satchel, damaged, track)

const ALL_LOCATIONS = `${FOREST}|${CLEARING}|${FACTION_BOARD}|${HAND}|${ALL_ITEM_STATE}|${EYRIE_DECREE_COLUMN}|${VAGABOND_BOARD_AREAS}`

const parseForRegexString = function(base: string): string {
    switch (base.toLowerCase()) {
        case ('number'):
            return '\\d*';
        case ('piece'):
            // [Faction]<PieceType>[_<subtype>]
            return `(${ALL_FACTIONS})?(${ALL_PIECE_TYPES})(_[a-z])?`;   // TODO: check this alpha doesn't cause false positives
        case ('card'):
            // [Faction]<PieceType>[_<subtype>]
            return `(${ALL_FACTIONS})?(${ALL_PIECE_TYPES})(_[a-z])?`;   // TODO: check this alpha doesn't cause false positives
        case ('component'):
            // piece, card, or item
            return `((${ALL_FACTIONS})?(${ALL_PIECE_TYPES})(_[a-z])?)|()`;
        case ('pieces'):
            const QUANTITY = '\\d*';
            const LOCATION = `(${ALL_LOCATIONS})`;
            return `[${ALL_PIECES_WITH_SPECIALS}]\\d*(\\+[${ALL_PIECES_WITH_SPECIALS}])*`; // one piece, optionally p+#p+...+#p
        case ('marquisepiece'):
            return `(${Object.values(MarquiseSpecial).join('|')}|[${ALL_PIECES}])`;
        case ('marquisepieces'):  // TODO: #pL+#pL+#pL ...  number, piece, AND location
            const PIECE_REGEX = `(${Object.values(MarquiseSpecial).join('|')}|[${ALL_PIECES}])`;    
            // return `[${PIECE_REGEX}]\\d*(\\+[${PIECE_REGEX}])*`; // one piece, optionally p+#p+...+#p`
            // ([Number]<Piece>+[Number]<Piece>+...+[Number]<Piece>)<Location>
            return `(\\d*${PIECE_REGEX})+(${ALL_LOCATIONS})`;
        case ('card'):
            return ALL_CARDS;
        case ('clearing'):
            return CLEARING;
        case ('location'):
            return `(${ALL_LOCATIONS})`;
        case ('suit'):
            return `[${ALL_SUITS}]`;
        case ('faction'):
            return `[${ALL_FACTIONS}]`;
        case ('roll'):
            return `[0-3]`;
        default:
            return base;
    }
}


export function formRegex(baseString: string): RegExp {
    const [leftHandSide, rightHandSide] = baseString.split('->');  // TODO: Also split on ^, reappend the correct one!
    let finalParsedRegexString = '';

    [leftHandSide, rightHandSide].forEach(splitString => {
        if (splitString === undefined) {
            return;
        }
        let parsedRegexString = '';
        let nestedStrings = [];
        let currentString = '';
        let openOptionalSections = 0;
        let openMandatorySections = 0;
        if (finalParsedRegexString.length > 0) {
            finalParsedRegexString += '->';  // Re-add the removed delimiter
        }

        [...splitString].forEach(c => {
            switch (c) {
                case '[':
                    if (openOptionalSections === 0 && openMandatorySections === 0) {
                        // We are not nested in brackets -> what was written up to this point was literal text
                        parsedRegexString += currentString;
                    } else {
                        // We *are* nested in brackets -> store the currentString in nested strings to resume working on after
                        // we close this new optional
                        nestedStrings.push(currentString);
                    }
                    currentString = '';
                    openOptionalSections++;
                    break;
                case ']':
                    if (openOptionalSections === 0) {
                        // This was not preceeded by a '[', so this isn't a syntax bracket. It's a literal ']' character
                        currentString += c;
                    } else if (nestedStrings.length === 0) {
                        // We are not nested in brackets, so start fresh with an empty string
                        parsedRegexString += `(${parseForRegexString(currentString)})?`;
                        currentString = '';
                        openOptionalSections--;
                    } else {
                        // We are nested in brackets, so resume working on the previous value
                        currentString = `${nestedStrings.pop()}(${parseForRegexString(currentString)})?`;
                        openOptionalSections--;
                    }
                    break;
                case '<':
                    if (openOptionalSections === 0 && openMandatorySections === 0) {
                        // We are not nested in brackets -> what was written up to this point was literal text
                        parsedRegexString += currentString;
                    } else {
                        // We *are* nested in brackets -> store the currentString in nested strings to resume working on after
                        // we close this new optional
                        nestedStrings.push(currentString);
                    }
                    currentString = '';
                    openMandatorySections++;
                    break;
                case '>':
                    if (openMandatorySections === 0) {
                        // This was not preceeded by a '<', so this isn't a syntax bracket. It's a literal '>' character
                        currentString += c;
                    } else if (nestedStrings.length === 0) {
                        // We are not nested in brackets, so start fresh with an empty string
                        parsedRegexString += `(${parseForRegexString(currentString)})`;
                        currentString = '';
                        openMandatorySections--;
                    } else {
                        // We are nested in brackets, so resume working on the previous value
                        currentString = `${nestedStrings.pop()}(${parseForRegexString(currentString)})`;
                        openMandatorySections--;
                    }
                    break;
                default:
                    currentString += c;
            }
        });
        finalParsedRegexString += `${parsedRegexString}(\\+${parsedRegexString})*`;
    });
    return new RegExp(finalParsedRegexString);
}
