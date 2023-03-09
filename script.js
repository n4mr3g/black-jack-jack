class Card {
	constructor(value, suit) {
		this._value = value;
		this._suit = suit;
	}

	static cardToFilename(value, suit) {
		let name = value;
		switch (suit) {
			case 1:
				name += "_of_clubs.svg";
				break;
			case 2:
				name += "_of_diamonds.svg";
				break;
			case 3:
				name += "_of_hearts.svg";
				break;
			case 4:
				name += "_of_spades.svg";
				break;
		}
		return name;
	}

	get value() {
		return this._value;
	}

	get suit() {
		return this._suit;
	}

	get fileName() {
		return Card.cardToFilename(this._value, this._suit);
	}
}

const cards = [];

function populateCards(cards) {
	for (let i = 0; i < 52; i++) {
		let value = i % 13 + 1;
		let suit = i % 4 + 1;
		let card = new Card(value, suit);
		cards.push(card);
	}
}

populateCards(cards);

for (let i = 0; i < cards.length; i++) {
	console.log(cards[i].fileName);
}

// console.log(cardToFilename(cards[0]));