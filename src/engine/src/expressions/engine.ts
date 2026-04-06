import vm from "node:vm";

export function expressionEngine(json: object, expression?: string): string {
  if (!expression) return "";
  const output = expression.match(/\{\{(.+?)\}\}/g) ?? [];

  let _finalExpression: string = expression;
  for (const expItem of output) {
    const replacedExp = expItem.replace("{{", "").replace("}}", "").trim();
    const result = vm.runInNewContext(replacedExp, {
      $json: json,
      $now: new Date(),
    });
    _finalExpression = _finalExpression.replaceAll(
      expItem,
      !result ? "" : result,
    );
  }

  return _finalExpression;
}
