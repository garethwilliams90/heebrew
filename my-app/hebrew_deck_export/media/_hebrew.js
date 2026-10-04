var root = document.documentElement
var isMobile = root.classList.contains("mobile")
var isBackCard = document.getElementById("back")
var playBtn = document.getElementById("play")

var audioElements = []
for (let x = playBtn; x; x = x.nextElementSibling)
	if (x.tagName === "AUDIO") audioElements.push(x)
var activeAudio = audioElements[0]
var isPlayingAll = true

var chosenExample = typeof chosenExample === "undefined" ? 0 : chosenExample
function getRandomChoice(len) {
	return isBackCard ?
		(isMobile ? sessionStorage.getItem("rdm") : chosenExample) :
		Math.floor(Math.random() * len)
}

function restoreLineBreaks(el) {
	if (el) el.innerHTML = el.innerHTML.replace(/;[ ]+/g, "<br>")
}

function resizeInputField(input, hide) {
	hide.textContent = input.value || input.placeholder
	input.style.width = `${Math.min(root.clientWidth - 24, hide.offsetWidth + 24)}px`
}

function table() {
	const tbody = document.querySelector('tbody')

	function expandRow() {
		this.style.display = "none"
		for (let next = this.nextElementSibling; next?.classList.contains("cont"); next = next.nextElementSibling)
			next.style.display = "table-row"
	}

	function collapseRow() {
		let i = this
		for (; i?.classList.contains("cont"); i = i.nextElementSibling)
			i.style.display = "none"
		for (i = this.previousElementSibling; !i.classList.contains("butt"); i = i.previousElementSibling)
			i.style.display = "none"
		i.style.display = "table-row"
	}

	const btn = tbody.getElementsByClassName("butt")
	for (let i = 0, len = btn.length; i < len; i++)
		btn[i].addEventListener("click", expandRow)

	const content = tbody.getElementsByClassName("cont")
	for (let i = 0, len = content.length; i < len; i++)
		content[i].addEventListener("click", collapseRow)

	let target = document.getElementById("m")?.parentNode
	while (target && !target.classList.contains('butt')) {
		target = target.previousElementSibling
		if (target?.tagName !== 'TR') {
			target = null
			break
		}
	}

	if (target)
		expandRow.call(target)
	else {
		const cols = tbody.getElementsByClassName("c​ol")
		if (cols.length)
			for (let i = 0, len = cols.length; i < len; i++) expandRow.call(cols[i])
		else
			expandRow.call(btn[0])
	}
}

function setupPealimLink(el) {
	if (!el) return

	const shoresh = el.textContent.replace(/שׂ|שׁ/g, "ש").split("־")
	const lastIdx = shoresh.length - 1
	const link = document.createElement("a")
	link.href = el.href

	if (shoresh !== "–" && lastIdx !== -1) {
		const map = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
		shoresh[lastIdx] = map[shoresh[lastIdx]] || shoresh[lastIdx]

		let href = "https://www.pealim.com/dict/?pos=all&num-radicals=" + shoresh.length + "&rf=" + shoresh[lastIdx]
		for (let i = 1; i < shoresh.length; ++i)
			href += "&r" + i + "=" + shoresh[i - 1]

		var timer = null
		el.addEventListener("click", e => {
			if (e.detail === 1) {
				timer = setTimeout(() => {
					link.href = el.href
					link.click()
				}, 444)
			} else {
				clearTimeout(timer)
				link.href = href
				link.click()
			}
		})
	} else
		el.addEventListener("click", () => link.click())
}

function createAudioSVG(el, isSentence, count) {
	const span = document.createElement("span")
	span.id = "audio"
	span.title = decodeURIComponent(el.src.split('/')[3])
	el.parentNode.insertBefore(span, el.nextSibling)

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	svg.setAttribute("viewBox", "0 0 32 32")
	span.appendChild(svg)

	const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
	polygon.setAttribute("points", isSentence ? "25,25 11,16 25,7" : "11,25 25,16 11,7")
	svg.appendChild(polygon)

	if (count) {
		const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
		text.setAttribute("y", "20")
		text.setAttribute("x", isSentence ? "17" : "12")
		text.setAttribute("font-size", "12")

		let display = count
		if (count > 9) {
			display = count > 99 ? "X" : Math.floor(count / 10)
			if (display !== "X") polygon.setAttribute("stroke", "gray")
		}

		text.textContent = display
		svg.appendChild(text)
	}

	const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
	rect.id = "blink"
	rect.setAttribute("width", "32")
	rect.setAttribute("height", "32")
	svg.appendChild(rect)

	span.addEventListener('click', e => {
		if (e.detail === 1) {
			timer = setTimeout(() => {
				const target = e.target.closest("#audio")
				if (target) {
					isPlayingAll = false
					if (activeAudio) {
						activeAudio.pause()
						activeAudio.currentTime = 0
					}
					activeAudio = target.previousSibling
					activeAudio.play()
				}
			}, 333)
		} else {
			clearTimeout(timer)
			if (e.target.closest("#voiced")) rerollVoicedExamples()
			else shuffleExamples()
		}
	})
}

function playAllAudio() {
	isPlayingAll = true
	let i = -1

	function playNext() {
		if (++i >= audioElements.length || !isPlayingAll) {
			for (let j = 0, len = audioElements.length; j < len; j++)
				audioElements[j].removeEventListener("ended", playNext)
			return
		}

		if (!activeAudio) return

		activeAudio.pause()
		activeAudio.currentTime = 0
		activeAudio = audioElements[i]

		const promise = activeAudio.play()
		if (promise) {
			promise.then(() => {
					if (isPlayingAll) audioElements[i].addEventListener("ended", playNext)
				})
				.catch(() => {
					playBtn.style.display = "inline"
				})
		}
	}
	playNext()
}

function shuffleExamples() {
	let selectedExample = allHebrewExamples

	if (allHebrewExamples.length > 5) {
		if (examples)
			for (var i = 0; i < examples.length; ++i)
				examples[i].style.display = "none"

		examples = Array.from(allHebrewExamples)
		const n = Math.max(Math.min(5, examples.length), 0)

		for (let i = 0; i < n; ++i) {
			const j = i + Math.floor(Math.random() * (examples.length - i));
			[examples[i], examples[j]] = [examples[j], examples[i]]
		}

		selectedExample = examples = examples.slice(0, n)

		const priorityElement = voicedExamples?.[chosenExample] || examples?.[chosenExample]
		if (priorityElement && !selectedExample.includes(priorityElement))
			selectedExample[0] = priorityElement
	}

	for (var i = 0; i < selectedExample.length; ++i)
		selectedExample[i].style.display = "block"
}

function rerollVoicedExamples() {
	if (voicedExamples.length <= 1) return

	const current = voicedExamples[chosenExample]
	current.removeAttribute("style")
	current.querySelector("polygon").removeAttribute("style")

	if (voicedExamples.length === 2)
		chosenExample = 1 - chosenExample
	else if (document.title[0] === "p")
		chosenExample = (chosenExample + 1) % voicedExamples.length
	else {
		let newChoice
		do
			newChoice = Math.floor(Math.random() * voicedExamples.length)
		while (newChoice === chosenExample)
		chosenExample = newChoice
	}

	if (isMobile && !isBackCard)
		sessionStorage.setItem("rdm", chosenExample)

	const next = voicedExamples[chosenExample]
	next.style.display = "block"
	next.querySelector("polygon").style.fill = "#BCBCBC"

	if (isBackCard) {
		activeAudio.pause()
		activeAudio.currentTime = 0
		const last = audioElements[audioElements.length - 1]
		last.pause()
		last.currentTime = 0
		audioElements[audioElements.length - 1] = activeAudio = next.lastChild.previousSibling
		activeAudio.play()
	}
}

function setupEventListeners() {
	document.addEventListener('keydown', e => {
		if (e.defaultPrevented || !e.ctrlKey) return
		if (e.key === "r") playAllAudio()
		else if (e.key === "m") shuffleExamples()
		else return
		e.preventDefault()
	})

	document.addEventListener('unload', () => {
		audioElements[audioElements.length - 1]?.pause()
		activeAudio?.pause()
	})
}

// Initialization
setupEventListeners()

var examples = document.getElementById("ex")?.children
var voicedExamples = document.getElementById("vo")?.children
var hasExamples = voicedExamples?.length ? voicedExamples : examples?.length ? examples : null

if (hasExamples) {
	chosenExample = getRandomChoice(hasExamples.length)
	if (isMobile && !isBackCard)
		sessionStorage.setItem("rdm", chosenExample)
	hasExamples[chosenExample].style.display = "block"

	if (voicedExamples?.length)
		audioElements.push(voicedExamples[chosenExample].firstChild)
}

if (isBackCard) {
	var allHebrewExamples = document.getElementsByClassName("heb")
	if (allHebrewExamples?.length) shuffleExamples()

	playAllAudio()

	const audios = document.getElementsByTagName("audio")
	for (let i = 0, len = audios.length; i < len; i++) {
		const el = audios[i]
		const isSpoken = el.parentNode.classList.contains("heb")

		let add = 0
		if (isSpoken && voicedExamples.length > 1 && (examples ? 5 - examples.length : 5) < voicedExamples.length)
			add = voicedExamples.length
		else if (!isSpoken && examples && (voicedExamples ? 5 - voicedExamples.length : 21) < examples.length)
			add = examples.length

		createAudioSVG(el, isSpoken, add)
	}

	if (voicedExamples?.length)
		voicedExamples[chosenExample].querySelector("polygon").style.fill = "#BCBCBC"
}

var code = document.getElementsByTagName("code")
restoreLineBreaks(code[0])
restoreLineBreaks(code[1])

var main = document.getElementById('main')
main.innerHTML = main.innerHTML.replace(/;[ ]+/g, "")

var input = document.querySelector('input')
var hide = document.getElementById('hide')
if (input) {
	input.addEventListener('input', () => resizeInputField(input, hide))
	resizeInputField(input, hide)
}

setupPealimLink(document.getElementById('pealim'))
