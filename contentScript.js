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

function getSamples(data) {
  var doc = new DOMParser().parseFromString(data, "text/html");
  var exampleBlocks = doc.querySelectorAll("div.example-block");
  var samples = [];

  exampleBlocks.forEach((block) => {
    let inputText = getText(block, "Input:");
    let outputText = getText(block, "Output:");

    if (inputText && outputText) {
      let input = parse_input(inputText);
      samples.push({ input, output: outputText });
    }
  });

  // For debugging
  console.log("Samples:", samples);

  return samples;
}

function getText(block, label) {
  let regex = new RegExp(label, "i");
  let pElements = block.getElementsByTagName("p");

  for (let p of pElements) {
    if (regex.test(p.innerHTML)) {
      let text = [];
      let sibling = p.firstChild;
      let capture = false;

      while (sibling) {
        if (capture) {
          if (sibling.nodeType === Node.TEXT_NODE) {
            text.push(sibling.textContent.trim());
          } else if (sibling.nodeType === Node.ELEMENT_NODE) {
            text.push(sibling.textContent.trim());
          }
        }

        if (
          sibling.nodeType === Node.TEXT_NODE &&
          regex.test(sibling.textContent)
        ) {
          capture = true;
        } else if (
          sibling.nodeType === Node.ELEMENT_NODE &&
          regex.test(sibling.innerHTML)
        ) {
          capture = true;
        }

        sibling = sibling.nextSibling;
      }

      return text.join(" ").trim();
    }
  }
  return null;
}

function parse_input(input_string) {
  input_string = input_string.split(", ");
  var data = [];
  for (let i = 0; i < input_string.length; i++) {
    var varname = input_string[i].split("=")[0].trim();
    var vardata = input_string[i].split("=")[1].trim();
    data.push([varname, vardata]);
  }
  console.log("data : ", data);
  return data;
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    // Navigator Clipboard API method
    return navigator.clipboard
      .writeText(text)
      .then(() => {
        showNotification("✅ " + getQuirkyMessage());
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        showNotification("Failed to copy", "See console for details");
      });
  } else {
    // Fallback method
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const success = document.execCommand("copy");
      if (success) {
        showNotification("✅ " + getQuirkyMessage());
      } else {
        showNotification("Failed to copy", "See console for details");
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      showNotification("Failed to copy", "See console for details");
    }
    document.body.removeChild(textArea);
  }
}

function run() {
  let data = "";

  data += document.documentElement.outerHTML + "\n\n";

  var codeSlug = getCodeSlug(data);

  var funcname = getFuncName(data);

  var samples = getSamples(data);

  copyToClipboard(tmp);
}
