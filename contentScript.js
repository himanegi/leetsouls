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

function isInt(n) {
  return Number(n) === n && n % 1 === 0;
}

function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}
function isBool(n) {
  return typeof n == "boolean";
}
function isStr(n) {
  return typeof n == "string";
}
function isList(a) {
  return Array.isArray(a);
}
function getDatatype(data) {
  if (isInt(data)) {
    return "int";
  } else if (isFloat(data)) {
    return "float";
  } else if (isBool(data)) {
    return "bool";
  } else if (isStr(data)) {
    return "string";
  } else if (isList(data)) {
    var temp = getDatatype(data[0]);
    temp = `vector<${temp}>`;
    return temp;
  } else {
    console.log("Unknown Datatype : " + data);
    return "None";
  }
}

function jsontocpp(data, index) {
  var res = "";
  for (let i = 0; i < data.length; i++) {
    var varname = data[i][0];
    console.log("varname : ", varname);
    //Console Inputs and Outputs
    console.log("data : ", data[i][1]);
    var datatype = getDatatype(JSON.parse(data[i][1]));
    var vardata = data[i][1];
    vardata = vardata.replaceAll("[", "{");
    vardata = vardata.replaceAll("]", "}");
    vardata = vardata.replaceAll("False", "false");
    vardata = vardata.replaceAll("True", "true");
    res += `${datatype} ${varname}${index} = ${vardata};`;
    res += "\n\t";
  }
  return res;
}

function jsontocpp2(data, index) {
  var res = "";

  var varname = "output_";
  var datatype = getDatatype(JSON.parse(data));
  var vardata = data;
  vardata = vardata.replaceAll("[", "{");
  vardata = vardata.replaceAll("]", "}");
  vardata = vardata.replaceAll("False", "false");
  vardata = vardata.replaceAll("True", "true");
  res += `${datatype} ${varname}${index} = ${vardata};`;
  res += "\n\t";

  return res;
}

function getSampleVariables(data, index) {
  var res = [];
  for (let i = 0; i < data.length; i++) {
    var varname = data[i][0];
    res.push(`${varname}${index}`);
  }
  return res.join(",");
}

function generateChecker(samples, funcname) {
  var inputs = [];
  var outputs = [];
  for (let i = 0; i < samples.length; i++) {
    inputs.push(samples[i].input);
    outputs.push(samples[i].output);
  }
  //Debugging
  console.log("inputs : ", inputs);
  console.log("outputs : ", outputs);
  var res = "";
  for (let i = 0; i < inputs.length; i++) {
    var x = inputs[i];
    var y = outputs[i];
    res += jsontocpp(x, i + 1);
    res += jsontocpp2(y, i + 1);
    res += `if(leetSouls.${funcname}(${getSampleVariables(x, i + 1)})==output_${
      i + 1
    }){\n\t\tcout << "Sample #${
      i + 1
    } : Accepted" << endl;\n\t}else{\n\t\tcout << "Sample #${
      i + 1
    } : Wrong Answer" << endl;\n\t}`;
    res += "\n";
    res += "\n\t";
  }
  return res;
}

function getTemplate() {
  temp = `// Generated By LeetSouls
    #include <bits/stdc++.h>
    using namespace std;
  
    $function
  
    int main() {
      
    $samples
  
      return 0;
    }`;
  return temp;
}

function generateCode(codeSlug, samples, funcname) {
  var TEMPLATE = getTemplate();
  TEMPLATE = TEMPLATE.replace("$function", codeSlug);
  TEMPLATE = TEMPLATE.replace(
    "$samples",
    "\tSolution leetSouls;\n\t" + generateChecker(samples, funcname)
  );

  return TEMPLATE;
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

function getQuirkyMessage() {
  const messages = [
    "LeetCode challenge extracted, Tarnished. Rise and code! 💻🌟",
    "Problem copied. Prepare to compile... repeatedly. ☠️🔄",
    "Challenge ahead, therefore time for coding! 🗡️⌨️",
    "Hesitation is defeat. Paste the code and face your runtime fears! ⏱️😱",
    "Amazing code ahead, and then praise the algorithm! 🙌🧠",
    "Don't give up, skeleton! Your IDE awaits! 💀💻",
    "Problem transported to clipboard. The night of the code hunt begins... 🌙🐺",
    "Challenge copied. May the good code guide your way! 🕯️🛤️",
    "Hidden code ahead. Time to git gud! 🕵️‍♂️🎮",
    "Behold, LeetCode! Time for strategic coding and then victory! 🏆🔍",
    "Visions of efficient algorithm... Now the real fight begins! 👁️⚔️",
    "Problem acquired, Ashen One. Link the code to appease the LeetCode Lords! 🔥👑",
    "Challenge beckons, Good Hunter. A programmer must code! 🩸🖋️",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.position = "fixed";
  notification.style.bottom = "0px";
  notification.style.left = "50%";
  notification.style.transform = "translateX(-50%) translateY(100%)";
  notification.style.backgroundColor = "#1A1A1A";
  notification.style.color = "#ffffff";
  notification.style.padding = "8px 16px";
  notification.style.borderRadius = "20px";
  notification.style.zIndex = "9999";
  notification.style.fontFamily = "Arial, sans-serif";
  notification.style.fontSize = "14px";
  notification.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5)";
  notification.style.display = "flex";
  notification.style.alignItems = "center";
  notification.style.opacity = "0";
  notification.style.transition = "opacity 0.5s, transform 0.5s";
  notification.innerHTML = `${message}`;

  document.body.appendChild(notification);

  // Fade in
  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(-50%) translateY(0)";
    notification.style.bottom = "50px";
  }, 50);

  // Fade out
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(-50%) translateY(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 2500);
}

function run() {
  let data = "";

  data += document.documentElement.outerHTML + "\n\n";

  var codeSlug = getCodeSlug(data);

  var funcname = getFuncName(data);

  var samples = getSamples(data);

  let tmp = generateCode(codeSlug, samples, funcname);

  copyToClipboard(tmp);
}

document.addEventListener("generateLocalTester", run);

console.log("LeetSouls content script loaded");
