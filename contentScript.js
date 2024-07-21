function getCodeSlug(data) {
  const start = "'value': 'cpp'";
  const end = "'defaultCode': '";

  const cppIndex = data.indexOf(start);

  const defaultCodeIndex = data.indexOf(end, cppIndex);

  const startIdx = defaultCodeIndex + end.length;
  const endIdx = data.indexOf("'", startIdx);

  if (endIdx === -1) return null;

  let cpp = data.slice(startIdx, endIdx);

  // Decode Unicode escape sequences
  cpp = cpp.replace(/\\u[\dA-F]{4}/gi, (match) =>
    String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16))
  );

  return cpp;
}

function getFuncName(data) {
  const metadataMarker = "metaData: JSON.parse('";
  const startIndex = data.indexOf(metadataMarker);

  if (startIndex === -1) return null;

  const jsonStartIndex = startIndex + metadataMarker.length;
  const jsonEndIndex = data.indexOf("'", jsonStartIndex);

  if (jsonEndIndex === -1) return null;

  let jsonString = data.slice(jsonStartIndex, jsonEndIndex);
  jsonString = jsonString.replace(/\\u[\dA-F]{4}/gi, (match) =>
    String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16))
  );

  try {
    const jsonData = JSON.parse(jsonString);
    return jsonData.name || null;
  } catch (error) {
    return null;
  }
}

function run() {
  let data = "";

  data += document.documentElement.outerHTML + "\n\n";

  var codeSlug = getCodeSlug(data);

  var funcname = getFuncName(data);
}
