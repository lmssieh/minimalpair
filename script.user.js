// ==UserScript==
// @name        minimalpair
// @namespace   Violentmonkey Scripts
// @match       *://forvo.com/*
// @require     https://unpkg.com/petite-vue@0.2.2/dist/petite-vue.iife.js
// @resource   IMPORTED_CSS https://raw.githubusercontent.com/lmssieh/minimalpair/main/styles.css
// @grant      GM_getResourceText
// @grant      GM_addStyle
// @version     1.0
// @author      -
// @description minimalpair
// ==/UserScript==

(function () {
	// prevent the script from running inside iframes.
	if (window.self !== window.top) return;

	// add css to the page.
	const css = GM_getResourceText("IMPORTED_CSS");
	GM_addStyle(css);

	// css for development
	const devCss = `
	`;
	const styles = `<style>${devCss}</style>`;
	document.head.innerHTML += styles;

	// add english words below.
	const words = `stake stock stick stuck stack
here hair hire
sheet shit
bad bed bud
bat bet but
rag rug
under ender
elf alf
tusk task
tuck tack
ten tan
sunk sank
summon salmon
stuff staff
struck strack
rump ramp
rum ram
ruf ref
rudder redder
putt pet pat
pun pen pan
puddle pedal paddle
must mest mast
musk mask
mug meg mag
mental mantle
lux lax
lug leg lag
hug hag
guess gas
funny fanny
fuck feck
dub deb dab
butter better batter
bun ben ban
green grin
bid bead
slip sleep
skied skid
river reaver
fit feet
crip creep
cist ceased
chit cheated
chick cheek
skill skeel
skim scheme
sit seat
scenic cynic
bit beat`;

	const formatWords = (words) => words.split("\n").map((e) => e.split(" "));

	// utils
	const { createApp } = PetiteVue;

	const getRandomItemFromArrray = (arr) =>
		arr[Math.floor(Math.random() * arr.length)];

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
		<div>
		<input id="customWords" v-model="canPracticeCustomWords" type="checkbox"  />
		<label for="customWords">Enter Custom Words</label>
		</div>
		<div class="minimalpair__child minimalpair__header">
			<h2>can you guess the word??</h2>
			<span v-if="!iframe.audioIsLoaded"> loading audio ...</span>
			<button v-else @click="playWordSound">play sound 🔊</button>
		</div>
		<div class="minimalpair__words minimalpair__child">
			<ul>
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
				<button v-if="selectedAnswer" @click="playAgain">
					Get another word
				</button>
			</div>
		</div>

		<div v-if="canPracticeCustomWords" class="custom-words">
			<h3>practice custom words</h3>
			<textarea
				v-model="customWordsInput"
				placeholder="seperate a set of words by a line, and seperate words by a space."
			></textarea>
			<div v-if="(customWordsInput.split(' ').length < 3)" style="color: crimson; padding-bottom: 1em;">enter at least 2 words</div>
			<button @click="playAgain">Practice Words</button>
		</div>

	</div>
</div>
`;
	document.querySelector("#wrap").insertAdjacentElement("afterBegin", root);

	// petite-vue init
	createApp({
		input: "",
		showApp: false,
		randomWords: null,
		randomWord: null,
		showResult: false,
		selectedAnswer: null,
		playWordSound: null,
		iframe: {
			ele: null,
			cleanup: null,
			audioIsLoaded: false,
		},
		customWordsInput: "",
		canPracticeCustomWords: false,

		getIframe() {
			if (this.iframe.ele) this.iframe.cleanUp();
			this.iframe.audioIsLoaded = false;
			if (this.canPracticeCustomWords) {
				if (this.customWordsInput.trim().split(" ").length < 1) return;
				this.randomWords = getRandomItemFromArrray(
					formatWords(this.customWordsInput)
				);
			} else {
				this.randomWords = getRandomItemFromArrray(formatWords(words));
			}
			this.randomWord = getRandomItemFromArrray(this.randomWords);
			const { iframe, isLoaded, cleanUp } = loadIframe(
				`https://forvo.com/word/${this.randomWord}/#en`
			);
			this.iframe.ele = iframe;
			this.iframe.cleanUp = cleanUp;

			isLoaded.then((iframe) => {
				let sounds = iframe.contentDocument.querySelectorAll(
					" article.pronunciations .play"
				);
				sounds = Array.from(sounds).filter(
					(e) =>
						e.parentNode.classList.contains("en_usa") ||
						e.parentNode.classList.contains("en_uk")
				);
				if (!sounds.length > 0) {
					alert("whoops, found no sound for " + this.randomWord);
				}

				this.playWordSound = function (...args) {
					if (!sounds.length) return;
					let selected = getRandomItemFromArrray([...sounds]);
					selected.onclick.apply(this, args);
				};
				this.iframe.audioIsLoaded = true;
				console.log(this.playWordSound);
				return;
			});
		},

		selectWord(word) {
			this.showResult = false;
			this.selectedAnswer = word;
		},

		playAgain() {
			this.selectedAnswer = false;
			this.getIframe();
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
