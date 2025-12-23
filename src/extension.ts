import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { commands, ExtensionContext, Range, window } from "vscode";
import { foreEachReversed } from "./utils/forEachReversed";
import { isConsoleLog } from "./utils/isConsoleLog";

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
        const ast = parser.parse(text, {
          sourceType: "module",
          plugins: ["typescript", "jsx"],
        });

        const nodesToKeep: Map<string, string[]> = new Map();
        const getNodeKey = (node: t.Node) => `${node.start} + ${node.end}`;

        const addNodesToKeep = (parent: t.Node, nodes: t.Node[]) => {
          nodesToKeep.set(
            getNodeKey(parent),
            nodes.map((node) => text.slice(node.start!, node.end!)),
          );
        };

        const nodesToDelete: t.Node[] = [];
        const addNodeToRemove = (...nodes: t.Node[]) => {
          nodesToDelete.push(
            ...nodes.filter(
              // allow rule for implicit nullish and undefined check
              // eslint-disable-next-line eqeqeq
              (node) => node.start != undefined && node.end != undefined,
            ),
          );
        };

        traverse(ast, {
          CallExpression: ({ node, parent }) => {
            if (!isConsoleLog(node)) {
              addNodeToRemove(...node.arguments.filter(isConsoleLog));
            }

            if (!isConsoleLog(node)) {
              return;
            }

            if (t.isArrowFunctionExpression(parent)) {
              //for arrow functions only add the range of the function body to be removed
              addNodeToRemove(node);
            }

            if (t.isExpressionStatement(parent)) {
              addNodeToRemove(parent);
            }

            if (t.isSequenceExpression(parent)) {
              addNodeToRemove(node);
            }

            // Remove nested console log calls inside console.log
            // Keep the arguments of the console.log call if they are function calls.
            // Keep the information of the parent node so we can add it back later at the position, when the parent is removed
            const args = node.arguments
              .filter(t.isCallExpression)
              .filter((arg) => !isConsoleLog(arg));
            addNodesToKeep(parent, args);
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
                editBuilder.insert(range.start, args.join(", "));
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

  context.subscriptions.push(removeCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
