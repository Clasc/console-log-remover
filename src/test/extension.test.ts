import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
  const wait = async (n = 50) => {
    return new Promise((resolve) => {
      setTimeout(resolve, n);
    });
  };

  vscode.window.showInformationMessage("Start all tests.");

  teardown(async () => {
    vscode.window.showInformationMessage("CLOSING");
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    await wait();
  });

  test("Remove multiline console.log", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: `console.log("hello there",
      12,
      23);`,
      language: "javascript",
    });

    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(text, "");
  });

  test("Remove single-line console.log", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: 'console.log("Hello, world!");',
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(text, "");
  });

  test("Remove console.log with object", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: `console.log({
        aha: 123,
        nana: 2134
      });`,
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(text, "");
  });

  test("Remove console.log without semicolon", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: 'console.log("No semicolon")',
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(text, "");
  });

  test.skip("Remove console.log passed as a function", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: "event.register(console.log);",
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(text, "event.register();");
  });

  test("Ignore console.log in comments", async () => {
    const content = `// console.log("This is a comment");
    /* console.log("This is also a comment"); */`;
    const document = await vscode.workspace.openTextDocument({
      content,
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    const text = document.getText();
    assert.strictEqual(text, content);
  });

  test("Ignore console.log in string literals", async () => {
    const document = await vscode.workspace.openTextDocument({
      content:
        'const str = "This is a console.log(123) statement inside a string";',
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    const text = document.getText();
    assert.strictEqual(
      text,
      'const str = "This is a console.log(123) statement inside a string";',
    );
  });

  test("Ignore console.log in template literals", async () => {
    const document = await vscode.workspace.openTextDocument({
      content:
        'const template = `console.log("This is inside a template literal")`;',
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    const text = document.getText();
    assert.strictEqual(
      text,
      'const template = `console.log("This is inside a template literal")`;',
    );
  });

  test.skip("Remove multiple console.log calls in a single line", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: 'console.log("First"), console.log("Second");',
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(text, " ");
  });

  test("Do not crash on syntax error", async () => {
    const content = `console.log(`;
    const document = await vscode.workspace.openTextDocument({
      content,
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(text, content);
  });

  test("Remove console.log with different parentheses styles", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: `console.log( "Hello" );`,
      language: "javascript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(text, "");
  });

  suite("nested call expression", () => {
    test("Keep nested function call inside console.log ", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `console.log(abc(1));`,
        language: "javascript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, `abc(1)`);
    });

    test("Remove nested console log calls inside console.log ", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `console.log(console.log(a));`,
        language: "javascript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, ``);
    });
  });

  suite("arrow functions", () => {
    test("Remove console.log in nested expressions", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `const obj = {
      method: () => console.log("Nested console.log"),
    };`,
        language: "javascript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(
        text,
        `const obj = {
      method: () => ,
    };`,
      );
    });

    test("Remove console.log in anonymous arrow function", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `() => console.log("Nested console.log");`,
        language: "javascript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, `() => ;`);
    });
  });
});
