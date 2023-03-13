// Class "Card" with static method "cardToFilename(value, suit)" and getter for the property "fileName".
// "get fileName" returns the complete filename (without the path), including extension, of the image of the card that calls it.
class Card {
	constructor(value, suit, isFaceDown = false) {
		this._value = value;
		this._suit = suit;
		this._isFaceDown = isFaceDown;
		this._cardStack = null;
	}

	set isFaceDown(faceDown) {
		this._isFaceDown = faceDown;
		if (!faceDown && this.cardStack !== undefined){
			this.cardStack.updatePoints();
		}
	}

	set cardStack(stack) {
		this._cardStack = stack;
	}
	
	get isFaceDown() {
		return this._isFaceDown;
	}

	get value() {
		return this._value;
	}

	get suit() {
		return this._suit;
	}

	get cardImage() {
		let name = cardsPath + this._value;
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
		this._points = 0;
		this._softPoints = 0;
		this._hardPoints = 0;
		this._printablePoints = "";
		this._aces = 0;
	}

	push(...cards) {
		for (let i = 0; i < cards.length; i++) {
			cards[i].cardStack = this;
			if (cards[i].isFaceDown) {continue;}
			if (cards[i].value === 1) {
				this._aces++;
			}
			
		}
		super.push(...cards);
		this.updatePoints();
	}

	reset() {
		this._points = 0;
		this._softPoints = 0;
		this._hardPoints = 0;
		this._printablePoints = "";
		this._aces = 0;
		this.length = 0;
	}


	get printablePoints() {
		this.updatePoints();
		let hard = this._hardPoints;
		let soft = this._softPoints;
		if (this._aces === 1 && hard < 11) {
			this._printablePoints = `${hard} / ${soft}`;
		}
		else {
			this._printablePoints = hard.toString();
		}
		return this._printablePoints;

	}

	updatePoints() {
		let points = 0;
		let hardPoints = 0;
		
		for (let i = 0; i < this.length; i++) {
			if (this[i].isFaceDown || this[i].value === 1) {continue;}
			let value = this[i].value >= 10 ? 10 : this[i].value;
			hardPoints += value;
		}
		console.log("Hard points: " + hardPoints);
		let softPoints = hardPoints;
		for (let i = 0; i < this._aces; i++) {
			if (hardPoints + 11 < 21) {
				softPoints += 11;
			} else {
				softPoints += 1;
			}
			hardPoints += 1;
		}
		this._softPoints = softPoints;
		this._hardPoints = hardPoints;
	  }

	get points() {
		this.updatePoints();
		let hard = this._hardPoints;
		let soft = this._softPoints;
		if (soft > hard && soft <= 21) {
			this._points = soft;
		} else {
			this._points = hard
		}
		return this._points;
	  }
}

// Global variables
const cardsPath = "./SVG-cards-1.3/";
const deck = new Deck;
const playerCards = new CardStack;
const dealerCards = new CardStack;
var	wins = 0;
var losses = 0;
var draws = 0;

function dealCard(receiver, deck, faceDown = false) {
	var $img = $("<img>");
	var card = deck.getCard();
	if (receiver === "dealer")
	{
		if (faceDown) {
			card.isFaceDown = true;
			$img.attr("src", `${cardsPath}Card_back_01.svg`);
		} else {
			$img.attr("src", card.cardImage);
		}
		dealerCards.push(card);
		$("#dealer-points").text(`Dealer: ${dealerCards.printablePoints}`);
	} else {
		$img.attr("src", card.cardImage);
		playerCards.push(card);
		$("#player-points").text(`Player: ${playerCards.printablePoints}`);
	}
	$img.addClass("card");
	$img.appendTo($(`#${receiver}-cards`));
}


// Events

$(document).on('keydown', function(event) {
	if (event.which === 81) { // Q key
        if ($('#hit-button').is(':enabled')) {
            onHitClick();
        }
    }
    else if (event.which === 87) { // W key
        if ($('#stand-button').is(':enabled')) {
            onStandClick();
        }
    }
    else if (event.which === 69) { // E key
        if ($('#deal-button').is(':enabled')) {
            onDealClick();
        }
    }
});

const onDealClick = function() {
	deck.populateCards();
	playerCards.reset();
	dealerCards.reset();
	$("#message").html("");
	$("#player-cards").html("");
	$("#dealer-cards").html("");
	$("#stand-button").attr("disabled", false);
	$("#hit-button").attr("disabled", false);
	$("#deal-button").attr("disabled", true);
	dealCard("player", deck);
	dealCard("dealer", deck, true);
	dealCard("player", deck);
	dealCard("dealer", deck);
	checkForBlackjack();
}

const onStandClick = function() {
	dealersTurn();
}

const onHitClick = function() {
	dealCard("player", deck);
	playersTurn();
}

$("#deal-button").bind("click", onDealClick);
$("#hit-button").bind("click", onHitClick);
$("#stand-button").bind("click", onStandClick);

// Blackjack check functions

const isTen = (card) => card.value >= 10;
const isAce = (card) => card.value === 1;

function checkForBlackjack(){
	let playerBj = playerCards.some(isTen) && playerCards.some(isAce);
	let dealerBj = dealerCards.some(isTen) && dealerCards.some(isAce);
	if (playerBj && dealerBj) {
		gameOver("draw", "Push! Click <em>Deal</em> to play again.");
		$("#player-points").html(`Player: <em>Blackjack!</em>`);
		flipDealersFirstCard("<em>Blackjack!</em>");
	} else if (dealerBj) {
		console.log("Dealer has blackjack");
		gameOver("loss", "Dealer has blackjack. Click <em>Deal</em> to play again.");
		flipDealersFirstCard("<em>Blackjack!</em>");
	} else if (playerBj) {
		console.log("<em>Blackjack!</em>");
		flipDealersFirstCard();
		gameOver("win", "You got Blackjack! Click <em>Deal</em> to play again.");
		$("#player-points").html(`Player: <em>Blackjack!</em>`);
	}
}

// Auxiliary functions

function flipDealersFirstCard(pts = undefined) {
		$("#dealer-cards").children(":first-child").attr('src', dealerCards[0].cardImage);
		dealerCards[0].isFaceDown = false;
		if (pts === undefined) {pts = dealerCards.printablePoints}
		$("#dealer-points").html(`Dealer: ${pts}`);
}

function updateScores() {
	$("#losses").html(`Losses:<br><br> ${losses}`);
	$("#wins").html(`Wins:<br><br> ${wins}`);
	$("#draws").html(`Draws:<br><br> ${draws}`);
}

// Game initialization

function gameOver(result = undefined, msg) {
	if (result == "win") {wins++;}
	else if (result == "loss") {losses++;}
	else if (result == "draw") {draws++;}
	updateScores();
	$("#hit-button").attr("disabled", true);
	$("#stand-button").attr("disabled", true);
	$("#deal-button").attr("disabled", false);
	$("#message").html(msg);
}

// Game flow functions

function playersTurn() {
	if (playerCards.points > 21) {
		console.log("Player bust!");
		flipDealersFirstCard();
		gameOver("loss", "Player bust! Click <em>Deal</em> to play again.");
	}
	else if (playerCards.points === 21){
		dealersTurn();
	}
}

function dealersTurn() {
			$("#stand-button").attr("disabled", true);
			$("#hit-button").attr("disabled", true);
			flipDealersFirstCard();
			while (dealerCards.points < 17) {
				dealCard("dealer", deck);
			}
			if (playerCards.points > dealerCards.points || dealerCards.points > 21) {
				if (dealerCards.points > 21) {
					gameOver("win", "Dealer bust. You won! Click <em>Deal</em> to play again.");
				} else {
					gameOver("win", "You won! Click <em>Deal</em> to play again.");
				}
			} else if(playerCards.points === dealerCards.points) {
				gameOver("draw", "Push! Click <em>Deal</em> to play again.");
			} else if (playerCards.points < dealerCards.points) {
				gameOver("loss", "You lost! Click <em>Deal</em> to play again.");
			}
}

gameOver("Click <em>Deal</em> to start playing!");