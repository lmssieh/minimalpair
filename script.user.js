// ==UserScript==
// @name        minimalpair
// @namespace   Violentmonkey Scripts
// @match       *://forvo.com/*
// @require     https://unpkg.com/petite-vue@0.2.2/dist/petite-vue.iife.js
// @grant       none
// @version     1.0
// @author      -
// @description minimalpair
// ==/UserScript==

(function () {
	if (window.self !== window.top) return;

	const css = `
	.top-banner {
		background: black;
		color: white;
		text-align: center;
		font-size: 120%;
		padding: 0.5em 0;
		cursor: pointer;
		text-decoration : underline;
		font-family: monospace ;
	}
	.minimalpair-iframe {
		display: none;
	}
	#minimalpair {
		font-family: monospace;
		position: absolute;
    background: #000;
    z-index: 99999;
    color: white;
    width: 100%;
    min-height: 100vh;
		display: flex;
		flex-direction: column;
}

#minimalpair button {
	color: white;
	border: solid 2px white;
	background: none;
	font-family: inherit;
	padding: 0.5em 1em;
	border-radius: 3px;
	font-weight: bold;
	line-height: 1em;

}
#minimalpair div {
	max-width: 600px;
	margin: 0 auto;
}

.minimalpair__topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: .5em 0;
}

.minimalpair__topbar h1 {
	font-size: 120%;
	background: linear-gradient(to bottom right,#40e0d0,#f1be44,#ff0080);
	padding: 0.5em 1em;
	font-weight: bold;
	color: black;
}

.minimalpair__topbar button {
	padding: 0.2em .4em;

}

#closeMinimalPairApp {
	margin-left: auto;
}
  .minimalpair__header {
		padding: 2em 0;
	}
	.minimalpair__header div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

.minimalpair__header h2 {
	padding: 1em 0;
}

.minimalpair__words {
	padding: 2em 0;
}
    .minimalpair__words ul {
      display: flex;
      justify-content: space-between;
      align-items: center;
			gap: 1em;
      padding: 0;
      list-style: none;
    }

    .minimalpair__words ul li {
      padding: 2rem;
      border: 2px solid white;
			background: white;
			color: black;
      cursor: pointer;
      border-radius: 5px;
      transition: all .3s ease;
  }

	.minimalpair__words ul li.active,
  .minimalpair__words ul li:hover {
    box-shadow: aliceblue 4px 4px;
    background: black;
    color: white;
}

#result {
	padding: 1em 0;
}

.hidden {
	display: none;
}
  `;
	const style = document.createElement("style");
	style.innerHTML = css;
	document.head.append(style);

	window.PetiteVue = PetiteVue;

	// utils

	const { createApp } = PetiteVue;

	const root = document.createElement("div");
	root.innerHTML = `<div v-if="!showApp" @click="showApp = true" class="top-banner">
	🤩 Try minimalpair app ⟶
</div>
<div id="minimalpair" v-else @mounted="getIframe">
	<div>
	<div class="minimalpair__child minimalpair__topbar">
	<h1>minimalpair</h1>
	<button @click="showApp = false">x</button>
</div>
<div class=" minimalpair__child minimalpair__header">
	<h2>can you guess the word??</h2>
	<button @click="playWordSound">play sound 🔊</button>
	</div>
<div class="minimalpair__words minimalpair__child">
	<ul >
		<li
			v-for="word in randomWords"
			:key="word"
			:class="{'active' : word === selectedAnswer}"
			@click="selectWord(word)"
		>
			{{word}}
		</li>
	</ul>
</div>
<div class="minimalpair__child">
	<button id="checkAnswer" @click="showResult = true;">Check Answer</button>
	<div v-if="showResult">
		<div id="result">{{ result() }}</div>
		<button v-if="selectedAnswer" @click="playAgain">Get another word</button>
	</div>
</div>
</div>
</div>
`;
	document.querySelector("#wrap").insertAdjacentElement("afterBegin", root);

	const words = [
		["stake", "stock", "stick", "stuck", "stack"],
		["here", "hair", "hire", "heare"],
	];

	function loadIframe(src) {
		var iframe = document.createElement("iframe");
		iframe.src = src;
		iframe.width = "0";
		iframe.height = "0";
		iframe.classList.add("minimalpair-iframe");
		document.body.prepend(iframe);

		const loadPromise = new Promise((res) => {
			iframe.onload = () => res(iframe);
		});

		function cleanUp() {
			document.body.removeChild(iframe);
		}

		return {
			iframe,
			isLoaded: loadPromise,
			cleanUp,
		};
	}

	// petite-vue init
	createApp({
		input: "",
		showApp: false,
		randomWords: null,
		randomWord: null,
		showResult: false,
		selectedAnswer: null,
		iframe: null,
		iframeCleanup: null,
		playWordSound: null,

		getIframe() {
			if (this.iframe) this.iframeCleanup();
			this.randomWords = this.getRandomItemFromArrray(words);
			this.randomWord = this.getRandomItemFromArrray(this.randomWords);
			const { iframe, isLoaded, cleanUp } = loadIframe(
				`https://forvo.com/word/${this.randomWord}/#en`
			);
			this.iframe = iframe;
			this.iframeCleanup = cleanUp;

			isLoaded.then((a) => {
				sounds = a.contentDocument.querySelectorAll(
					" article.pronunciations .play"
				);
				this.playWordSound = [...sounds][1].onclick;
				console.log(this.playWordSound);
				return;
			});
		},

		getRandomItemFromArrray(arr) {
			const randomNumber = Math.floor(Math.random() * arr.length);
			return arr[randomNumber];
		},

		selectWord(word) {
			this.showResult = false;
			this.selectedAnswer = word;
		},

		playAgain() {
			this.selectedAnswer = false;
			this.getIframe();
		},

		log(value) {
			console.log(value);
		},

		result() {
			if (!this.selectedAnswer) return `please select a word`;
			if (this.randomWord === this.selectedAnswer) {
				return `Correct! 🎉`;
			} else {
				return `Incorrect! 😱, Try selecting another word.`;
			}
		},
	}).mount();
})();
