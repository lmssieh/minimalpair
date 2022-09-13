// ==UserScript==
// @name        minimalpair
// @namespace   Violentmonkey Scripts
// @match       *://forvo.com/*
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
		text-style: underline;
		font-family: monospace ;
	}
	.minimalpair-iframe {
		display: none;
	}
	#minimalpair {
		display: none;
		font-family: monospace;
	}
  .show-minimalpair #minimalpair {
    margin: 1rem auto;
		position: absolute;
    margin: 1rem auto;
    background: #000;
    z-index: 99999;
    color: white;
    width: 100%;
    min-height: 100vh;
		display: block;
}
#minimalpair button {
	color: white;
	border: solid 2px white;
	background: none;
	font-family: inherit;
	padding: 0.5em 1em;
	border-radius: 3px;
	font-weight: bold;
}
  .minimalpair__header div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

    ul.minimalpair__words {
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* padding: 1rem; */
      list-style: none;
    }

    ul.minimalpair__words li {
      padding: 2rem;
      border: 2px solid white;
			background: white;
			color: black;
      cursor: pointer;
      border-radius: 5px;
      transition: all .3s ease;
  }

	ul.minimalpair__words li.active,
  ul.minimalpair__words li:hover {
    box-shadow: aliceblue 4px 4px;
    background: black;
    color: white;
}

.hidden {
	display: none;
}

  `;

	const style = document.createElement("style");
	style.innerHTML = css;
	document.head.append(style);

	// utils
	function getRandomItemFromArrray(arr) {
		const randomNumber = Math.floor(Math.random() * arr.length);
		console.log(randomNumber);
		return arr[randomNumber];
	}

	console.log("called");
	const words = [
		["stake", "stock", "stick", "stuck", "stack"],
		["here", "hair", "hire", "heare"],
	];

	const randomWords = words[1];
	const randomWord = getRandomItemFromArrray(randomWords);

	let selectedAnswer = null;

	function generateUI() {
		const topBannerHtml = `
		<div class="top-banner">
			Try minimalpair app ==
		</div>`;

		document
			.querySelector("#wrap")
			.insertAdjacentHTML("afterBegin", topBannerHtml);

		document.querySelector(".top-banner").addEventListener("click", () => {
			document.body.classList.add("show-minimalpair");
		});

		const generateVoiceHTML = () => {
			let str = `
    <div>
			<button id="closeMinimalPairApp">Close App</button>
      can you guess the word??
      <button id="playRandomWord">play</button>
      spoiler: ${randomWord}
    </div>
    `;
			return str;
		};

		const generateWordsHtml = (words) => {
			let str = ``;
			words.forEach((word) => (str += `<li>${word}</li>`));
			return str;
		};

		const appHTML = `
    <div id="minimalpair">
    <div class="minimalpair__header">
    ${generateVoiceHTML()}
    </div>
    <ul class="minimalpair__words">
    ${generateWordsHtml(randomWords)}
    </ul>
		<button id="checkAnswer">Check Answer</button>
		<div id="result" class="hidden">Result</div>
    </div>
  `;
		document.querySelector("#wrap").insertAdjacentHTML("afterBegin", appHTML);

		document
			.querySelector("#closeMinimalPairApp")
			.addEventListener("click", () => {
				document.body.classList.remove("show-minimalpair");
			});

		document
			.querySelector(".minimalpair__words")
			.addEventListener("click", ({ target }) => {
				if (target.tagName === "LI") {
					document
						.querySelector(".minimalpair__words .active")
						?.classList.remove("active");
					target.classList.add("active");
					selectedAnswer = target.textContent;
					console.log(selectedAnswer);
				}
			});

		const resultEle = document.querySelector("#result");
		document.querySelector("#checkAnswer").addEventListener("click", () => {
			resultEle.classList.remove("hidden");
			if (selectedAnswer === randomWord) {
				resultEle.textContent = "Correct! 🎉";
				resultEle.className("correct");
			} else {
				resultEle.textContent = "Wrong 🎉";
				resultEle.className("wrong");
			}
		});
	}

	generateUI();

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

	const { iframe, isLoaded, cleanUp } = loadIframe(
		`https://forvo.com/word/${randomWord}/#en`
	);

	let callRandomWordSound = null;

	isLoaded.then((a) => {
		console.log("finally loaded call backup");
		console.log(iframe);
		sounds = a.contentDocument.querySelectorAll(
			" article.pronunciations .play"
		);
		callRandomWordSound = [...sounds][1].onclick;
		document.querySelector("#playRandomWord").addEventListener("click", () => {
			console.log("btn clicked");
			callRandomWordSound();
		});
		return;
	});
})();
