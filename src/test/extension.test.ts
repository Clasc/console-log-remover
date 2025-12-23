import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
  const wait = async (n = 50) => {
    return new Promise((resolve) => {
      setTimeout(resolve, n);
    });
  };

  /**
   * Use for tests where whitespaces could break the assertion.
   * Code editors might change the indentation of the code on save.
   */
  const normalize = (str: string) =>
    str
      .replace(/(?:\r\n|\r|\n)/g, "")
      .replace(/\s+/g, " ")
      .trim();

  vscode.window.showInformationMessage("Start all tests.");

  teardown(async () => {
    vscode.window.showInformationMessage("CLOSING");
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    await wait();
  });

  test("Remove multiline console.log", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: `type X= "A";
      console.log("hello there",
      12,
      23);`,
      language: "typescript",
    });

    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(normalize(text), normalize('type X= "A";'));
  });

  test("Remove single-line console.log", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: 'console.log("Hello, world!");',
      language: "typescript",
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
      language: "typescript",
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
      language: "typescript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    await wait();
    const text = document.getText();
    assert.strictEqual(text, "");
  });

  test("Remove console.log passed as a function", async () => {
    const document = await vscode.workspace.openTextDocument({
      content: "event.register(console.log);",
      language: "typescript",
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
      language: "typescript",
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
      language: "typescript",
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
      language: "typescript",
    });
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("console-log-remover.remove");
    const text = document.getText();
    assert.strictEqual(
      text,
      'const template = `console.log("This is inside a template literal")`;',
    );
  });

  suite("Sequence Expression", () => {
    test("Remove multiple console.log calls in a single line", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: 'console.log("First"), console.log("Second");',
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, ", ;");
    });

    test("Remove multiple console.log calls in a single line that are mixed with other statements. Keep other statements.", async () => {
      const document = await vscode.workspace.openTextDocument({
        content:
          'console.log("First"), testFunc("someVal",123) ,console.log("Second");',
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, ', testFunc("someVal",123) ,;');
    });
  });

  suite("Additional Test Cases", () => {
    test("Remove console.log with null value", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: "console.log(null);",
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, "");
    });

    test("Remove console.log with template literals containing newlines", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: "console.log(`Value:\n${value}`);",
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, "");
    });

    test("Ignore chained console.log call", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: 'someFunction().console.log("Chained call");',
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, 'someFunction().console.log("Chained call");');
    });

    test.skip("Remove console.log with nested await", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `async function fetchData() {
    console.log(await fetch("https://example.com"));
  }`,
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(
        text,
        `async function fetchData() {
    await fetch("https://example.com")
  }`,
      );
    });

    test("Remove console.log in try-catch block", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `try {
    throw new Error("Error");
  } catch (error) {
    console.log(error);
  }`,
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(
        normalize(text),
        normalize(`try {
    throw new Error("Error");
  } catch (error) { }`),
      );
    });

    test("Remove console.log in class method", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `class MyClass {
        method() {console.log("Class method");}
  }`,
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(
        text,
        `class MyClass {
        method() {}
  }`,
      );
    });

    test("Remove console.log in switch statement", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `switch (value) {
    case 1:
      console.log("Case 1");
      break;
  }`,
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(
        normalize(text),
        normalize(`switch (value) {
    case 1:
          break;
  }`),
      );
    });

    test("Ignore console.log in object property", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `const abc = {
    log: console.log,
  };`,
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(
        text,
        `const abc = {
    log: console.log,
  };`,
      );
    });

    test("Remove console.log with smiley", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: 'console.log("This is a smiley :) inside a log");',
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, "");
    });

    test("Remove console.log with comment before", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `console /* console.log */ .log("this is tricky.");`,
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, ``);
    });
  });

  test("Do not crash on syntax error", async () => {
    const content = `console.log(`;
    const document = await vscode.workspace.openTextDocument({
      content,
      language: "typescript",
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
      language: "typescript",
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
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, `abc(1)`);
    });

    test("Keep multiple nested function calls inside console.log ", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `console.log(abc(1), def(2), ghi(3));`,
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, `abc(1), def(2), ghi(3)`);
    });

    test("Remove nested console log calls inside console.log ", async () => {
      const document = await vscode.workspace.openTextDocument({
        content: `console.log(console.log(a));`,
        language: "typescript",
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
        language: "typescript",
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
        language: "typescript",
      });
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("console-log-remover.remove");
      await wait();
      const text = document.getText();
      assert.strictEqual(text, `() => ;`);
    });
  });
});
