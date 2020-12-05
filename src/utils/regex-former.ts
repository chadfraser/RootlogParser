import { Card, Faction, Item, ItemState, Piece, Suit, MarquiseSpecial, EyrieDecreeColumnSpecial, EyrieLeaderSpecial, WoodlandSpecial, VagabondItemSpecial, RiverfolkSpecial, LizardSpecial, DuchySpecial, CorvidSpecial } from '../interfaces';

export const ALL_FACTIONS = Object.values(Faction).join('') + '#';
export const ALL_SUITS = Object.values(Suit).join('');
export const ALL_ITEM_TYPES = Object.values(Item).join('');
export const ALL_PIECE_TYPES = Object.values(Piece).join('');
export const ALL_ITEM_STATE = Object.values(ItemState).join('');
export const ALL_CARD_NAMES = `(${Object.values(Card).join('|')})`;  // one of the card's codenames, in full
// a card's codename or one of the Eyrie leader's names, in full
// const ALL_CARDS_WITH_SPECIALS = `(${ALL_CARDS}|${Object.values(EyrieLeaderSpecial)})`;

// const ALL_PIECES_WITH_SPECIALS = `(${ALL_PIECES}|${Object.values(MarquiseSpecial).join('|')}\
// |${Object.values(WoodlandSpecial).join('|')}|${Object.values(RiverfolkSpecial).join('|')}\
// |${Object.values(LizardSpecial).join('|')}|${Object.values(DuchySpecial).join('|')}\
// |${Object.values(CorvidSpecial).join('|')})`

const CLEARING = '(1[0-2]|[1-9])'; // a number from 1-12
const FOREST = `(${CLEARING}(_${CLEARING}){2,})`;  // 3+ adjacent clearings, separated by underscores
const FACTION_BOARD = `(([${ALL_FACTIONS}])?\$)`;  // $, optionally preceeded by a faction's character code 
const HAND = `([${ALL_FACTIONS}])`;  // The faction's character code
// const EYRIE_DECREE_COLUMN =  `(${Object.values(EyrieDecreeColumnSpecial).join('|')})`;  // r, m, x, b, for cards in the Decree
// const VAGABOND_BOARD_AREAS = `[${Object.values(VagabondItemSpecial).join('')}]`;  // s, d, or t, for items (satchel, damaged, track)

const ALL_LOCATIONS = `(${FOREST}|${CLEARING}|${FACTION_BOARD}|${HAND}|[${ALL_ITEM_STATE}])`//|${EYRIE_DECREE_COLUMN}|${VAGABOND_BOARD_AREAS}`

// [Faction]<PieceType>[_<subtype>]
const PIECE_REGEX_STRING = `([${ALL_FACTIONS}])?([${ALL_PIECE_TYPES}])(_[a-z])?`;   // TODO: check this alpha doesn't cause false positives
// [Suit]#<CardName>
const CARD_REGEX_STRING = `([${ALL_SUITS}])?#(${ALL_CARD_NAMES})`;
// %<ItemType> or %_ to represent 'all items'
const ITEM_REGEX_STRING = `(%[${ALL_ITEM_TYPES}_])`;
// piece, card, or item
const COMPONENT_REGEX_STRING = `(${PIECE_REGEX_STRING}|${CARD_REGEX_STRING}|${ITEM_REGEX_STRING})`;

const parseForRegexString = function(base: string): string {
    const [groupCode, groupName] = base.split('|||');
    switch (groupCode.toLowerCase()) {
        case ('number'):
            return parseForRegexString2('\\d*', groupName);
        case ('piece'):
            return parseForRegexString2(PIECE_REGEX_STRING, groupName);
        case ('card'):
            return parseForRegexString2(CARD_REGEX_STRING, groupName);
        case ('item'):
            return parseForRegexString2(ITEM_REGEX_STRING, groupName);
        case ('component'):
            return parseForRegexString2(COMPONENT_REGEX_STRING, groupName);
        case ('combinedcomponent'):
            const QUANTITY = '\\d*';
            return parseForRegexString2(`(((${QUANTITY})?${COMPONENT_REGEX_STRING})+${ALL_LOCATIONS})`, groupName); // one component, optionally (#p+#p+...+#p)<location>
        case ('clearing'):
            return parseForRegexString2(CLEARING, groupName);
        case ('factionboard'):
            return parseForRegexString2(FACTION_BOARD, groupName);
        case ('location'):
            return parseForRegexString2(ALL_LOCATIONS, groupName);
        case ('craftable'):
            return parseForRegexString2(`(${ALL_CARD_NAMES}|[${ITEM_REGEX_STRING}])`, groupName);
        // case ('marquisepiece'):
        //     return parseForRegexString2(`(${Object.values(MarquiseSpecial).join('|')}|[${ALL_PIECES}])`, groupName);
        // case ('marquisepieces'):  // TODO: #pL+#pL+#pL ...  number, piece, AND location
        //     const PIECE_REGEX = `(${Object.values(MarquiseSpecial).join('|')}|[${ALL_PIECES}])`;    
        //     // return parseForRegexString2(`[${PIECE_REGEX}]\\d*(\\+[${PIECE_REGEX}])*`; // one piece, optionally p+#p+...+#p, groupName)`
        //     // ([Number]<Piece>+[Number]<Piece>+...+[Number]<Piece>)<Location>
        //     return parseForRegexString2(`(\\d*${PIECE_REGEX})+(${ALL_LOCATIONS})`, groupName);
        case ('suit'):
            return parseForRegexString2(`[${ALL_SUITS}]`, groupName);
        case ('faction'):
            return parseForRegexString2(`[${ALL_FACTIONS}]`, groupName);
        case ('roll'):
            return parseForRegexString2(`[0-3]`, groupName);
        default:
            return parseForRegexString2(groupCode, groupName);
    }
}

const parseForRegexString2 = function(parsedRegex: string, groupName: string): string {
    let regexString = '(';
    if (groupName !== undefined) {
        regexString = `(?<${groupName}>`;
    }
    return `${regexString}${parsedRegex})`;
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

        [...splitString].forEach((c, idx) => {
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
                    if (splitString.length > idx && splitString[idx+1] === '-') {
                        currentString += c;
                        break;
                    } else if (openOptionalSections === 0 && openMandatorySections === 0) {
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
        parsedRegexString += currentString;
        // TODO: Fix since it's wrecking named capture groups
        // finalParsedRegexString += `${parsedRegexString}(+|$)*`// `${parsedRegexString}(\\+${parsedRegexString})*`;
        finalParsedRegexString += parsedRegexString;// `${parsedRegexString}(\\+${parsedRegexString})*`;
    });
    return new RegExp('finalParsedRegexString');
}
