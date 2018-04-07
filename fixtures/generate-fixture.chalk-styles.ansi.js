const fs = require('fs')
const chalk = require('chalk')

const lines = [
	[
		'bold',
		'dim',
		'italic',
		'underline',
		'inverse',
		'strikethrough'
	],

	[
		'bold.black',
		'bold.red',
		'bold.green',
		'bold.yellow',
		'bold.blue',
		'bold.magenta',
		'bold.cyan',
		'bold.white'
	],

	[
		'bold.gray',
		'black.redBright',
		'black.greenBright',
		'black.yellowBright',
		'black.blueBright',
		'black.magentaBright',
		'black.cyanBright',
		'black.whiteBright'
	],

	[
		'white.bold.bgBlack',
		'black.bold.bgRed',
		'black.bold.bgGreen',
		'black.bold.bgYellow',
		'black.bold.bgBlue',
		'black.bold.bgMagenta',
		'black.bold.bgCyan',
		'black.bold.bgWhite'
	],

	[
		'white.italic.bgBlackBright',
		'black.italic.bgRedBright',
		'black.italic.bgGreenBright',
		'black.italic.bgYellowBright',
		'black.italic.bgBlueBright',
		'black.italic.bgMagentaBright',
		'black.italic.bgCyanBright',
		'black.italic.bgWhiteBright'
	]
]

const applyChalk = parts => {
	let style = chalk

	parts.forEach(part => {
		style = style[part]
	})

	return style
}

let output = ''

lines.forEach(line => {
	line.forEach(name => {
		const parts = name.split('.')
		const lastPart = parts[parts.length - 1].padEnd(16, ' ')
		const style = applyChalk(parts)
		const str = style(lastPart)
		output += str + ' '
	})

	output += '\n'
})

console.log(output)
console.log(JSON.stringify(output))

fs.writeFileSync('example.chalk-styles.ansi', output)
