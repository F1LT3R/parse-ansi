import fs from 'fs'
import chalk from 'chalk'
import test from 'ava'
import ansiParse from '.'

const fixtures = {
	chalkStylesAnsi: fs.readFileSync('./fixtures/fixture.chalk-styles.ansi').toString()
}

test('cover all chalk styles', t => {
	const parsed = ansiParse(fixtures.chalkStylesAnsi).chunks
	const actual = JSON.stringify(parsed, null, 2)
	const expectFile = `./fixtures/fixture.chalk-styles.ansi.expected.utf8`
	// // Save expected:
	// fs.writeFileSync(expectFile, actual)
	const expected = fs.readFileSync(expectFile).toString()
	t.deepEqual(actual, expected)
})

test('gets opening red ansi escape char', t => {
	const text = chalk.red('_')
	const parsed = ansiParse(text)
	const firstAnsi = parsed.chunks[0].value.ansi
	t.is(firstAnsi, '\u001B[31m')
})

test('parses colors', t => {
	const text = chalk`Your {red wish} is\n {bgYellow my} command.`
	const parsed = ansiParse(text).chunks
	const actual = JSON.stringify(parsed, null, 2)
	const expectFile = `./fixtures/fixture.your-wish-is-my-command.expected.json`
	// // Save expected:
	// fs.writeFileSync(expectFile, actual)
	const expected = fs.readFileSync(expectFile).toString()
	t.deepEqual(actual, expected)
})

test('resets styles', t => {
	const text = chalk`{red RED}\n{bgGreen GREEN}`
	const parsed = ansiParse(text).chunks
	const actual = JSON.stringify(parsed, null, 2)
	const expectFile = `./fixtures/fixture.reset-styles.expected.json`
	// // Save expected:
	// fs.writeFileSync(expectFile, actual)
	const expected = fs.readFileSync(expectFile).toString()
	t.deepEqual(actual, expected)
})

test('parses robot face as string', t => {
	const text = '🤖\u001B[31m DANGER\u001B[0m Will Robbinson'
	const parsed = ansiParse(text).chunks
	const actual = JSON.stringify(parsed, null, 2)
	const expectFile = `./fixtures/fixture.robot-face-as-string.expected.json`
	// // Save expected:
	// fs.writeFileSync(expectFile, actual)
	const expected = fs.readFileSync(expectFile).toString()
	t.deepEqual(actual, expected)
})

test('reset bold', t => {
	const text = `\u001B[1m BOLD\u001B[0m NORMAL`
	const parsed = ansiParse(text)
	t.deepEqual(parsed.chunks[3].style, {})
})

test('open/close the rainbow', t => {
	const text = chalk.red('red ') +
		chalk.yellow('yellow ') +
		chalk.green('green ') +
		chalk.cyan('cyan ') +
		chalk.blue('blue ') +
		chalk.magenta('magenta')
	const parsed = ansiParse(text).chunks
	const actual = JSON.stringify(parsed, null, 2)
	const expectFile = `./fixtures/fixture.open-close-rainbow.expected.json`
	// // Save expected:
	// fs.writeFileSync(expectFile, actual)
	const expected = fs.readFileSync(expectFile).toString()
	t.deepEqual(actual, expected)
})

test('meassures text area', t => {
	const x2x3 = '012\n345\n678'
	const parsed = ansiParse(x2x3)
	t.deepEqual(parsed.textArea, {
		columns: 3,
		rows: 3
	})
})

test('gets raw ansi', t => {
	const text = '🤖\u001B[31m DANGER\u001B[0m Will Robbinson'
	const parsed = ansiParse(text)
	t.is(parsed.raw, '🤖\u001B[31m DANGER\u001B[0m Will Robbinson')
})

test('gets plaintext', t => {
	const text = '🤖\u001B[31m DANGER\u001B[0m Will Robbinson'
	const parsed = ansiParse(text)
	t.is(parsed.plainText, '🤖 DANGER Will Robbinson')
})

