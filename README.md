# Console.log Remover

An intelligent VS Code extension that goes beyond simple text searching to safely and surgically remove `console.log` statements from your codebase using AST (Abstract Syntax Tree) parsing.

## 🚀 Why this is better than Search & Replace

We often use a Regex-based search and replace to clean up logs. This is risky, takes effort, and often leads to broken code. This extension uses `@babel/parser` to understand your code's structure, offering several advantages:

1.  **Context Awareness**: It won't touch `console.log` strings inside your comments, string literals, or template strings.
2.  **Syntax Safety**: It understands the boundaries of expressions. It won't accidentally leave behind trailing semicolons or delete too much of a line.
3.  **Smart Preservation**: It can identify nested function calls *inside* a log and keep them while removing the log itself.
4.  **Language Support**: Built-in support for **TypeScript**, **JSX**, and **TSX** out of the box.

## ✨ Key Features

-   **Deep Cleaning**: Removes single-line and multi-line `console.log` statements.
-   **Smart Removal**: If you have logic inside your logs (like a function call that performs a side effect), the extension keeps the function call but removes the wrapper.
-   **Arrow Function Support**: Correctly handles logs inside expression-bodied arrow functions.
-   **Safety First**: Specifically avoids modifying code inside comments or strings.

## 📖 Examples

### Smart Removal (Preserving Logic)
Standard tools would delete the entire line, potentially breaking your logic if the function inside the log was necessary. This extension extracts the inner call:

**Before:**
```javascript
console.log(initializeAnalytics(), fetchData(id));
```
**After:**
```javascript
initializeAnalytics(), fetchData(id);
```

### Safety with Comments and Strings
**Before:**
```javascript
// console.log("I am a comment");
const msg = "Don't delete this console.log(123)";
console.log("Delete me");
```
**After:**
```javascript
// console.log("I am a comment");
const msg = "Don't delete this console.log(123)";
```

### Nested Console Logs
If you accidentally nested logs, it cleans them up recursively.
**Before:**
```javascript
console.log(console.log("Deep log"));
```
**After:**
*(Entirely removed)*

### Arrow Functions
**Before:**
```javascript
const logData = (data) => console.log(data);
```
**After:**
```javascript
const logData = (data) => data;
```

## 🛠 Usage

1.  Open the file you want to clean.
2.  Open the **Command Palette** (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux).
3.  Type `Remove console logs in current file` and hit enter.

## ⚙️ Requirements

-   Visual Studio Code v1.107.0 or higher.

## 📝 Known Issues

-   Currently focuses strictly on `console.log`. Future support for `console.error`, `console.warn`, etc., is planned.

## ⚖️ License

MIT © [Christian Konnaris](https://github.com/ckonnaris)
