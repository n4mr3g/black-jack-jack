// Path to the card images
const cardsDirectory = "./SVG-cards-1.3/";

// Class "Card" with static method "cardToFilename(value, suit)" and getter for the property "fileName".
// "get fileName" returns the complete filename (without the path), including extension, of the image of the card that calls it.
class Card {
	constructor(value, suit, isFaceDown = false) {
		this._value = value;
		this._suit = suit;
	}

	get value() {
		return this._value;
	}

	get suit() {
		return this._suit;
	}

	get cardImage() {
		let name = cardsDirectory + this._value;
		switch (this._suit) {
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
}

// Class "Deck" with methods "getCard()" and "populateCards()".
// populateCards() fills up the deck with cards.
// getCard() removes a card from the array and returns it.
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

// Class "CardStack", representing a hand of cards. Both the player and the dealer should have one instance.
// Has a counter for aces, adjusts its total points accordingly.
// ".getTotalPoints()" goes through the array and returns the total points of the hand, considering the aces.
// TODO: Implement a better way to solve Aces logic. Example: 
// get aces() {return this._aces;}

class CardStack extends Array {
	constructor() {
		super();
		this._totalPoints = 0;
		this._aces = 0;
	}

	reset() {
		this._aces = 0;
		this._totalPoints = 0;
		this.length = 0;
	}

	get totalPoints() {
		let points = 0;
		let aces = 0;
		for (let i = 0; i < this.length; i++) {
			if (this[i].value >= 10) {
				points += 10;
			} else if (this[i].value === 1) {
				aces++;
			} else {
				points += this[i].value;
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

// Global variables
const deck = new Deck;
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
			cardImage.src = card.cardImage;
		}
		dealerCards.push(card);
	} else {
		cardImage.src = card.cardImage;
		playerCards.push(card);
	}
	cardImage.className = "card";
	cardField.appendChild(cardImage);
}

gameInit();

// Events

const onDealClick = function() {
	deck.populateCards();
	playerCards.reset();
	dealerCards.reset();
	playerCardsField.innerHTML = "";
	dealerCardsField.innerHTML = "";
	standButton.disabled = false;
	hitButton.disabled = false;
	dealButton.disabled = true;
	dealCard(playerCardsField, deck);
	dealCard(dealerCardsField, deck, true);
	dealCard(playerCardsField, deck);
	dealCard(dealerCardsField, deck);
	if (playerCards.some(isTen) && playerCards.some(isAce))
	{
		console.log("Blackjack!");
		gameInit();
		return "win";
	}
}

const onHitClick = function() {
	dealCard(playerCardsField, deck);
	playersTurn();
}

// Blackjack check functions (if the player is dealt an ace and a 10/K/Q/J as the first hand, the player wins with Blackjack)
const isTen = (card) => card.value >= 10;
const isAce = (card) => card.value === 1;


function playersTurn() {
	if (playerCards.totalPoints > 21) {
		console.log("Player bust!");
		gameInit();
		return "lost";
	}
	if (playerCards.totalPoints === 21){
		dealersTurn();
		return;
	}
}

function dealersTurn() {
			//disable buttons
			standButton.disabled = true;
			hitButton.disabled = true;
			//turn card face up
			dealerCardsField.firstChild.src = dealerCards[0].cardImage;
			//check for blackjack
			//if no blackjack, AI starts dealing cards
			while (dealerCards.totalPoints < 17) {
				dealCard(dealerCardsField, deck);
			}
			if (playerCards.totalPoints > dealerCards.totalPoints || dealerCards.totalPoints > 21) {
				console.log("Player wins!");
				gameInit();
				return "win";
			} else if(playerCards.totalPoints === dealerCards.totalPoints) {
				console.log("Push");
				gameInit();
				return "push";
			} else if (playerCards.totalPoints < dealerCards.totalPoints) {
				console.log("Player lost!");
				gameInit();
				return "lose";
		}
}

const onStandClick = function() {
		dealersTurn();

}

dealButton.addEventListener("click", onDealClick);
hitButton.addEventListener("click", onHitClick);
standButton.addEventListener("click", onStandClick);


// Game initialization
function gameInit() {
	hitButton.disabled = true;
	standButton.disabled = true;
	dealButton.disabled = false;
}

// Debugging below

/* for (let i = 0; i < cards.length; i++) {
	console.log(cards[i].fileName);
} */

// console.log(cardToFilename(cards[0]));