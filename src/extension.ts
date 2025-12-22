// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { commands, ExtensionContext, Range, window } from "vscode";
import { foreEachReversed } from "./utils/forEachReversed";

// Extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // The commandId parameter must match the command field in package.json
  const removeCommand = commands.registerCommand(
    "console-log-remover.remove",
    () => {
      const document = window.activeTextEditor?.document;
      if (!document) {
        return;
      }

      const text = document.getText();

      try {
        const ast = parser.parse(text, { plugins: ["typescript", "jsx"] });

        const nodesToDelete: t.Node[] = [];
        const nodesToKeep: Map<string, string[]> = new Map();

        const isConsoleLog = (node: t.CallExpression) =>
          t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.object, { name: "console" }) &&
          t.isIdentifier(node.callee.property) &&
          node.callee.property.name === "log";

        const getNodeKey = (node: t.Node) => `${node.start} + ${node.end}`;

        const addNodesToKeep = (parent: t.Node, nodes: t.Node[]) => {
          nodesToKeep.set(
            getNodeKey(parent),
            nodes.map((node) => text.slice(node.start!, node.end!)),
          );
        };

        const addRangeToRemove = (node: t.Node) => {
          if (node.start != undefined && node.end != undefined) {
            nodesToDelete.push(node);
          }
        };

        traverse(ast, {
          CallExpression: (path) => {
            const node = path.node;

            if (!isConsoleLog(node)) {
              return;
            }

            if (t.isArrowFunctionExpression(path.parent)) {
              //for arrow functions only add the range of the function body to be removed
              addRangeToRemove(node);
            }

            if (t.isExpressionStatement(path.parent)) {
              addRangeToRemove(path.parent);
            }

            // Remove nested console log calls inside console.log
            // Keep the arguments of the console.log call if they are function calls.
            // Keep the information of the parent node so we can add it back later at the position, when the parent is removed
            const args = node.arguments
              .filter(t.isCallExpression)
              .filter((arg) => !isConsoleLog(arg));
            addNodesToKeep(path.parent, args);
          },
        });

        window.activeTextEditor
          ?.edit((editBuilder) => {
            // loop in reverse to avoid messing up positions while deleting
            foreEachReversed(nodesToDelete, (node) => {
              const range = new Range(
                document.positionAt(node.start!),
                document.positionAt(node.end!),
              );
              editBuilder.delete(range);

              // reinsert the node that should be kept inside the parent node
              const args = nodesToKeep.get(getNodeKey(node));
              if (args) {
                args.forEach((arg) => {
                  editBuilder.insert(range.start, arg);
                });
              }
            });
          })
          .then((success) => {
            if (success) {
              window.showInformationMessage(
                nodesToDelete.length + " Console logs removed successfully!",
              );
            } else {
              window.showErrorMessage("Failed to remove console logs.");
            }
          });
      } catch (error) {
        window.showErrorMessage(
          "Could not parse document. Make sure it does not contain any syntax errors. or is a js/ts file.",
        );
      }
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
