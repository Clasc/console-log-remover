// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext, window } from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "console-log-remover" is now active! 🎉',
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const removeCommand = commands.registerCommand(
    "console-log-remover.remove",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user

      window.activeTextEditor?.edit((editBuilder) => {
		window.showInformationMessage("Starting console log Removal on File: "+  window.activeTextEditor?.document.fileName);
        const document = window.activeTextEditor?.document;
        if (!document) {
          return;
        }
        const text = document.getText();
        const regex = /(?<!\.)console\.log\([\s\S]*?\);?|(?<!\.)console\.log/g;
        const matches = text.match(regex);
        if (!matches) {
          return;
        }
        matches.forEach((match) => {
          const range = document.getWordRangeAtPosition(
            document.positionAt(text.indexOf(match)),
          );
          if (!range) {
            return;
          }
          editBuilder.delete(range);
        });
      });
    },
  );

  const toggleCommand = commands.registerCommand(
    "console-log-remover.toggle",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      window.showInformationMessage("Hello World from Console.log Remover!");
    },
  );

  context.subscriptions.push(removeCommand, toggleCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
