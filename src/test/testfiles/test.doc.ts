/**
 * This is a test TypeScript file for manual testing of the console log remover extension.
 */

// seutp helper functions & values
const testme = (x: number) => x * 2;
const event = {
    register: (callback: (...args: any[]) => void) => {
    }
};
const value = 42;
const gemma = (str: string) => str.toUpperCase();
const something = {
    console: { log: () => {} }
};

const someFunction = () => {
    return {
        console: {
            log: (msg: string) => {}
        }
    };
};

// console logs to be ignored
const x = console.log;
something.console.log();
someFunction().console.log("This should not be removed");
x("This should also not be removed");

// console.log inside strings should not be removed
const str1 = "This is a string with console.log inside";
const str2 = 'Another string with console.log inside';
const str3 = `Template string with console.log inside: ${console.log("test")}`;

// console.log inside comments should not be removed
// console.log("This is a comment");

/* console.log("This is also a comment"); */

/*
 * console.log("This is also a comment");
 */


// ------ Actual console.log statements to be removed ------

console.log("Hello, World!"); // simple log

console.log(42); // log with number

console.log("Value is:", value); // log with multiple arguments

console.log(`Template literal with value: ${value}`); // log with template literal

console.log({ key: "value", num: 123 }); // log with object

console.log([1, 2, 3, 4, 5]); // log with array

console.log(true, false, null, undefined); // log with booleans and null/undefined


(console.log(123), console.log("124"), testme(123));

console.log({}, undefined);

console.log(null);


(console.log(123), console.log(1243));

const myFunc = () => {
  console.log("hello", 12, 23);
  console.log({
    aha: 123,
    nana: 2134,
  });
};

const logData = (data:any) => console.log(data);

event.register(console.log);

console.log(`Value:
${value}`);

async function fetchData() {
    // keep the fetch call here.
  console.log(fetch("https://example.com"));
}
try {
  throw new Error("Error");
} catch (error) {
  console.log(error);
}

const func = () => console.log("Arrow function");
console.log(console.log("Nested console.log"));

console.log(gemma("test"));

class MyClass {
  method() {
    console.log("Class method");
  }
}

switch (value as number) {
  case 1:
    console.log("Case 1");
    break;
default:
    console.log("Default case");
    break;
}


const def = {
  bla: () => console.log("test"),
  blba: () => {
    console.log(testme(123));
  },
};

console.log("This is a smiley :) inside a log");

console.log("ABC"); /* console.log("Inside comment") */

console /* console.log */
  .log("this is tricky.");
