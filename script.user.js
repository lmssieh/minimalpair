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
  #minimalpair {
    max-width: 600px;
    margin: 1rem auto;
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
      border: 2px solid #000;
      cursor: pointer;
      border-radius: 5px;
      transition: all .3s ease;
  }

  ul.minimalpair__words li:hover {
    box-shadow: aliceblue 4px 4px;
    background: black;
    color: white;
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

	function generateUI() {
		const generateVoiceHTML = () => {
			let str = `
    <div>
      can you guess the word??
      <button id="playRandomWord">play</button>
      ${randomWord}
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
    </div>
  `;
		document.body.innerHTML += appHTML;
	}

	generateUI();

	function loadIframe(src) {
		var iframe = document.createElement("iframe");
		iframe.src = src;
		iframe.width = "0";
		iframe.height = "0";
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
