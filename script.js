class Card {
	constructor(value, suit, isFaceDown = false) {
		this._value = value;
		this._suit = suit;
		this._isFaceDown = isFaceDown;
	}

	set isFaceDown(faceDown) {
		this._isFaceDown = faceDown;
	}
	
	get isFaceDown() {
		return this._isFaceDown;
	}

	get value() {
		return this._value;
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

// Class "CardHand", representing a hand of cards. Both the player and the dealer should have one instance.
class CardHand extends Array {
	constructor() {
		super();
		this._points = 0;
		this._softPoints = 0;
		this._hardPoints = 0;
		this._printablePoints = "";
	}

	push(...cards) {
		super.push(...cards);
		this.updatePoints();
	}

	reset() {
		this._points = 0;
		this._softPoints = 0;
		this._hardPoints = 0;
		this._printablePoints = "";
		this.length = 0;
	}

	get printablePoints() {
		this.updatePoints();
		let hard = this._hardPoints;
		let soft = this._softPoints;
		if (hard < 11 && soft < 21 && hard !== soft) {
			this._printablePoints = `${hard} / ${soft}`;
		}
		else {
			this._printablePoints = hard.toString();
		}
		return this._printablePoints;

	}

	updatePoints() {
		let hardPoints = 0;
		let aces = 0;
		for (let i = 0; i < this.length; i++) {
			if (this[i].isFaceDown) {continue;}
			let value = this[i].value >= 10 ? 10 : this[i].value;
			if (value === 1) {aces++;}
			hardPoints += value;
		}
		let softPoints = hardPoints;
		if (aces && softPoints + 10 <= 21) {
			softPoints += 10;
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
const playerHand = new CardHand;
const dealerHand = new CardHand;
var	wins = 0;
var losses = 0;
var draws = 0;


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
	playerHand.reset();
	dealerHand.reset();
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


// Auxiliary functions

function flipDealersFirstCard(pts = undefined) {
		$("#dealer-cards").children(":first-child").attr('src', dealerHand[0].cardImage);
		dealerHand[0].isFaceDown = false;
		if (pts === undefined) {pts = dealerHand.printablePoints}
		$("#dealer-points").html(`Dealer: ${pts}`);
}


// Blackjack check functions

const isTen = (card) => card.value >= 10;
const isAce = (card) => card.value === 1;

function checkForBlackjack(){
	let playerBj = playerHand.some(isTen) && playerHand.some(isAce);
	let dealerBj = dealerHand.some(isTen) && dealerHand.some(isAce);
	if (playerBj && dealerBj) {
		flipDealersFirstCard("<em>Blackjack!</em>");
		$("#player-points").html(`Player: <em>Blackjack!</em>`);
		gameOver("draw", "Push! Click <em>Deal</em> to play again.");
	} else if (dealerBj) {
		flipDealersFirstCard("<em>Blackjack!</em>");
		gameOver("loss", "Dealer has blackjack. Click <em>Deal</em> to play again.");
	} else if (playerBj) {
		flipDealersFirstCard();
		$("#player-points").html(`Player: <em>Blackjack!</em>`);
		gameOver("win", "You got Blackjack! Click <em>Deal</em> to play again.");
	}
}


// Game initialization

function gameOver(result = undefined, msg) {
	if (result == "win") {
		$("#wins").html(`Wins:<br><br> ${++wins}`);
	}
	else if (result == "loss") {
		$("#losses").html(`Losses:<br><br> ${++losses}`);
	}
	else if (result == "draw") {
		$("#draws").html(`Draws:<br><br> ${++draws}`)
	}
	$("#hit-button").attr("disabled", true);
	$("#stand-button").attr("disabled", true);
	$("#deal-button").attr("disabled", false);
	$("#message").html(msg);
}


// Game flow functions

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
		dealerHand.push(card);
		$("#dealer-points").text(`Dealer: ${dealerHand.printablePoints}`);
	} else {
		$img.attr("src", card.cardImage);
		playerHand.push(card);
		$("#player-points").text(`Player: ${playerHand.printablePoints}`);
	}
	$img.addClass("card");
	$img.appendTo($(`#${receiver}-cards`));
}

function playersTurn() {
	if (playerHand.points > 21) {
		flipDealersFirstCard();
		gameOver("loss", "Player bust! Click <em>Deal</em> to play again.");
	}
	else if (playerHand.points === 21){
		dealersTurn();
	}
}

function dealersTurn() {
			$("#stand-button").attr("disabled", true);
			$("#hit-button").attr("disabled", true);
			flipDealersFirstCard();
			while (dealerHand.points < 17) {
				dealCard("dealer", deck);
			}
			if (dealerHand.points > 21) {
				gameOver("win", "Dealer bust. You won! Click <em>Deal</em> to play again.");
			} else if (playerHand.points > dealerHand.points){
				gameOver("win", "You won! Click <em>Deal</em> to play again.");
			} else if(playerHand.points === dealerHand.points) {
				gameOver("draw", "Push! Click <em>Deal</em> to play again.");
			} else if (playerHand.points < dealerHand.points) {
				gameOver("loss", "You lost! Click <em>Deal</em> to play again.");
			}
		}