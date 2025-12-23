import * as t from "@babel/types";

const isConsoleLogCall = (node: t.CallExpression) =>
  t.isMemberExpression(node.callee) &&
  t.isIdentifier(node.callee.object, { name: "console" }) &&
  t.isIdentifier(node.callee.property) &&
  node.callee.property.name === "log";

const isConsoleLogMemberExpression = (node: t.MemberExpression) =>
  t.isIdentifier(node.object, { name: "console" }) &&
  t.isIdentifier(node.property) &&
  node.property.name === "log";

export const isConsoleLog = (node: t.Node) => {
  if (t.isMemberExpression(node)) {
    return isConsoleLogMemberExpression(node);
  } else if (t.isCallExpression(node)) {
    return isConsoleLogCall(node);
  } else {
    return false;
  }
};
