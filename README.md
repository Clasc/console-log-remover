# Console Log Remover

A lightweight and efficient VS Code extension to remove or toggle `console.log` statements in your code. Perfect for cleaning up debug logs or quickly enabling/disabling logging during development.

## Features

- **Remove Console Logs**: Quickly remove all `console.log` statements from your file.
- **Toggle Console Logs**: Comment or uncomment all `console.log` statements with a single command.
- **Supports Multiple Languages**: Works with JavaScript, TypeScript, and other languages that use `console.log`.

### Demo

![Remove Console Logs](images/remove-logs.gif)
![Toggle Console Logs](images/toggle-logs.gif)

## Requirements

- Visual Studio Code (v1.50.0 or higher)
- No additional dependencies required.

## Extension Settings

This extension does not require any configuration. Simply install and use the commands provided.

## Usage

1. Open a file containing `console.log` statements.
2. Use the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`) and search for:
   - `Remove Console Logs`: Removes all `console.log` statements from the file.
   - `Toggle Console Logs`: Comments or uncomments all `console.log` statements.

## Known Issues

- Currently, the extension only supports `console.log`. Support for other console methods (`console.error`, `console.warn`, etc.).

## Release Notes

### 1.0.0

- Initial release with support for removing and toggling `console.log` statements.

---

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

## License

This extension is licensed under the [MIT License](LICENSE).

**Happy Coding!**
