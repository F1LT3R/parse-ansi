const arrayUniq = require('array-uniq')
const ansiRegex = require('ansi-regex')
const superSplit = require('super-split')
const stripAnsi = require('strip-ansi')

const ansiTags = require('./ansi-seqs-to-ansi-tags')
const decorators = require('./ansi-tags-to-decorator-names')

const meassureTextArea = plainText => {
	const lines = plainText.split('\n')
	const rows = lines.length

	let columns = 0
	lines.forEach(line => {
		const len = line.length

		if (len > columns) {
			columns = len
		}
	})

	return {columns, rows}
}

// Atomize
// Splits text into "words" by sticky delimiters [ANSI Escape Seq, \n]
// Eg: words = ['\u001b[37m', 'Line 1', '\n', 'Line 2', '\u001b[39m']
const atomize = text => {
	const ansies = arrayUniq(text.match(ansiRegex()))
	const words = superSplit(text, ansies.concat(['\n']))
	return {ansies, words}
}

const parse = ansi => {
	const plainText = stripAnsi(ansi)
	const textArea = meassureTextArea(plainText)

	const result = {
		raw: ansi,
		plainText,
		textArea,
		chunks: []
	}

	const {
		ansies,
		words
	} = atomize(ansi)

	const styleStack = {
		foregroundColor: [],
		backgroundColor: [],
		boldDim: []
	}

	const getForegroundColor = () => {
		if (styleStack.foregroundColor.length > 0) {
			return styleStack.foregroundColor[styleStack.foregroundColor.length - 1]
		}
		return false
	}

	const getBackgroundColor = () => {
		if (styleStack.backgroundColor.length > 0) {
			return styleStack.backgroundColor[styleStack.backgroundColor.length - 1]
		}
		return false
	}

	const getDim = () => {
		return styleStack.boldDim.includes('dim')
	}

	const getBold = () => {
		return styleStack.boldDim.includes('bold')
	}

	const styleState = {
		italic: false,
		underline: false,
		inverse: false,
		hidden: false,
		strikethrough: false
	}

	let x = 0
	let y = 0
	let nAnsi = 0
	let nPlain = 0

	const bundle = (type, value) => {
		const chunk = {
			type,
			value,
			position: {
				x, y, n: nPlain, raw: nAnsi
			}
		}

		if (type === 'text' || type === 'ansi') {
			const style = {}

			const foregroundColor = getForegroundColor()
			const backgroundColor = getBackgroundColor()
			const dim = getDim()
			const bold = getBold()

			if (foregroundColor) {
				style.foregroundColor = foregroundColor
			}

			if (backgroundColor) {
				style.backgroundColor = backgroundColor
			}

			if (dim) {
				style.dim = dim
			}

			if (bold) {
				style.bold = bold
			}

			if (styleState.italic) {
				style.italic = true
			}

			if (styleState.underline) {
				style.underline = true
			}

			if (styleState.inverse) {
				style.inverse = true
			}

			if (styleState.strikethrough) {
				style.strikethrough = true
			}

			chunk.style = style
		}

		return chunk
	}

	words.forEach(word => {
		// Newline character
		if (word === '\n') {
			const chunk = bundle('newline', '\n')
			result.chunks.push(chunk)

			x = 0
			y += 1
			nAnsi += 1
			nPlain += 1
			return
		}

		// Text characters
		if (ansies.includes(word) === false) {
			const chunk = bundle('text', word)
			result.chunks.push(chunk)

			x += word.length
			nAnsi += word.length
			nPlain += word.length
			return
		}

		// ANSI Escape characters
		const ansiTag = ansiTags[word]
		const decorator = decorators[ansiTag]
		const color = ansiTag

		if (decorator === 'foregroundColorOpen') {
			styleStack.foregroundColor.push(color)
		}

		if (decorator === 'foregroundColorClose') {
			styleStack.foregroundColor.pop()
		}

		if (decorator === 'backgroundColorOpen') {
			styleStack.backgroundColor.push(color)
		}

		if (decorator === 'backgroundColorClose') {
			styleStack.backgroundColor.pop()
		}

		if (decorator === 'boldOpen') {
			styleStack.boldDim.push('bold')
		}

		if (decorator === 'dimOpen') {
			styleStack.boldDim.push('dim')
		}

		if (decorator === 'boldDimClose') {
			styleStack.boldDim.pop()
		}

		if (decorator === 'italicOpen') {
			styleState.italic = true
		}

		if (decorator === 'italicClose') {
			styleState.italic = false
		}

		if (decorator === 'underlineOpen') {
			styleState.underline = true
		}

		if (decorator === 'underlineClose') {
			styleState.underline = false
		}

		if (decorator === 'inverseOpen') {
			styleState.inverse = true
		}

		if (decorator === 'inverseClose') {
			styleState.inverse = false
		}

		if (decorator === 'strikethroughOpen') {
			styleState.strikethrough = true
		}

		if (decorator === 'strikethroughClose') {
			styleState.strikethrough = false
		}

		if (decorator === 'reset') {
			styleState.strikethrough = false
			styleState.inverse = false
			styleState.italic = false
			styleStack.boldDim = []
			styleStack.backgroundColor = []
			styleStack.foregroundColor = []
		}

		const chunk = bundle('ansi', {
			tag: ansiTag,
			ansi: word,
			decorator
		})

		result.chunks.push(chunk)
		nAnsi += word.length
	})

	return result
}

module.exports = parse
