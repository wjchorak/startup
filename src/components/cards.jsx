const suits = [0, 1, 2, 3];
const values = [
    { value: 11,  display: 'A' },
    { value: 2,  display: '2' },
    { value: 3,  display: '3' },
    { value: 4,  display: '4' },
    { value: 5,  display: '5' },
    { value: 6,  display: '6' },
    { value: 7,  display: '7' },
    { value: 8,  display: '8' },
    { value: 9,  display: '9' },
    { value: 10,  display: '10' },
    { value: 10,  display: 'J' },
    { value: 10,  display: 'Q' },
    { value: 10,  display: 'K' }
];

function getNewDeck() {
    let deck = [];
    for (const suit of suits) {
        for (const {value, display}  of values) {
            deck.push({value, display, suit});
        }
    }

    for (let i = deck.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

function drawCard(deck, hand) {
    if (deck.length === 0) {
        console.log("Error: out of cards :(");
        return null;
    }

    let card = deck.pop();
    hand.push(card);
    return card;
}