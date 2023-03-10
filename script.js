const cardsDirectory = "./SVG-cards-1.3/";

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

class Deck extends Array {
	constructor() {
		super();
		this.populateCards();
	}

	populateCards() {
		this.length = 0;
		for (let i = 0; i < 52; i++) {
			let value = i % 13 + 1;
			let suit = i % 4 + 1;
			let card = new Card(value, suit);
			this.push(card);
		}
	}

	getCard() {
		return this.splice(Math.floor(Math.random() * this.length), 1)[0];
	}
}

class CardStack extends Array {
	constructor() {
		super();
		this._totalPoints = 0;
		this._aces = 0;
	}

	get totalPoints() {
		let points = 0;
		let aces = 0;
		for (let i = 0; i < this.length; i++) {
			if (this[i].value >= 10) {
				points += 10;
			} else if (this[i].value === 1) {
				aces++;
			}
		}
		while (aces--) {
			if (points + 11 > 21) {
				points += 1;
			} else {
				points += 11;
			}
		}
		return points;
	}
}

const deck = new Deck;

/* function populateCards(cards) {
	for (let i = 0; i < 52; i++) {
		let value = i % 13 + 1;
		let suit = i % 4 + 1;
		let card = new Card(value, suit);
		cards.push(card);
	}
} */


// Card stacks

const playerCards = new CardStack;
const dealerCards = new CardStack;

// Elements
const dealButton = document.getElementById("deal");
const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");
const dealerCardsField = document.getElementById("dealer-cards");
const playerCardsField = document.getElementById("player-cards");

function dealCard(cardField, deck, faceDown = false) {
	if (deck.length === 0) {
		console.log("Woops, out of cards!");
		return;
	}
	var card, cardImage;
	cardImage = document.createElement("img");
	card = deck.getCard();
	if (cardField === dealerCardsField)
	{
		if (faceDown) {
			cardImage.src = cardsDirectory + "Card_back_01.svg";
		} else {
			cardImage.src = cardsDirectory + card.fileName;
		}
		dealerCards.push(card);
	} else {
		cardImage.src = cardsDirectory + card.fileName;
		playerCards.push(card);
	}
	cardImage.className = "card";
	cardField.appendChild(cardImage);
	gameUpdate();
}

function gameUpdate() {
	if (playerCards.totalPoints > 21) {
		console.log("Player bust!");
		//count lose;
		//restart game
	} else if (playerCards.totalPoints === 21){
		//disable buttons
		//check for blackjack
		//if no blackjack, AI starts dealing cards
	} else if (dealerCards.totalPoints < 17){
		dealCard(dealerCards, deck);
	}
}

// Events


const onDealClick = function(e) {
	e.target.disabled = true;
	dealCard(playerCardsField, deck);
	dealCard(dealerCardsField, deck);
	dealCard(playerCardsField, deck);
	dealCard(dealerCardsField, deck, true);
}

const onHitClick = function() {
	dealCard(playerCardsField, deck);
}
const onStandClick = function(e) {
	
}

dealButton.addEventListener("click", onDealClick);
hitButton.addEventListener("click", onHitClick);
standButton.addEventListener("click", onStandClick);


// Validator functions

function getTrueValue(value, cardStack) {

}

// Main game loop

function gameLoop() {
	let playerPoints = 0;
	let dealerPoints = 0;
	for (let i = 0; i < playerCards.length; i++) {
		playerPoints += getTrueValue(playerCards[i].value, cardStack);
	}
}

// Debugging below

/* for (let i = 0; i < cards.length; i++) {
	console.log(cards[i].fileName);
} */

// console.log(cardToFilename(cards[0]));