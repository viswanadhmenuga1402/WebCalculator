# Scientific Calculator

A modern, attractive scientific calculator built with pure HTML, CSS, and JavaScript.

![Calculator](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-blue)

## Features

- Basic arithmetic: `+ - × ÷ % ^`
- Scientific functions: `sin cos tan sqrt ln log`
- Constants: `π` (pi) and `e`
- Factorial `x!` and power `xʸ`
- Parentheses and nested expressions
- Calculation history (click to reuse a result)
- Keyboard input support
- Dark / light theme toggle (persisted)
- Copy result to clipboard
- Responsive layout (mobile friendly)
- **No `eval()`** — expressions are parsed with a safe recursive-descent parser

## Usage

Just open `index.html` in any modern browser. No build step, no dependencies.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `0-9`, `.` | Input digits |
| `+ - * / % ^` | Operators |
| `(` `)` | Parentheses |
| `Enter` / `=` | Calculate |
| `Backspace` | Delete last character |
| `Esc` | Clear |

## Security

This project deliberately avoids `eval()` and `Function()`. User input is tokenized and evaluated by a small recursive-descent parser that only understands numbers, operators, parentheses, and a fixed allow-list of functions and constants. This prevents code injection through the display.

## License

MIT
