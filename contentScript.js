function getCodeSlug(data) {
  const start = "'value': 'cpp'";
  const end = "'defaultCode': '";

  const cppIndex = data.indexOf(start);

  const defaultCodeIndex = data.indexOf(end, cppIndex);

  const startIdx = defaultCodeIndex + end.length;
  const endIdx = data.indexOf("'", startIdx);

  if (endIdx === -1) return null;

  let cpp = data.slice(startIdx, endIdx);

  return cpp;
}

function run() {
  let data = "";

  data += document.documentElement.outerHTML + "\n\n";

  var codeSlug = getCodeSlug(data);
}
