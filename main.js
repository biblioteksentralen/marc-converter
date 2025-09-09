import {
  parseMarcXml,
  serializeLineMarc,
} from "https://cdn.jsdelivr.net/npm/@biblioteksentralen/marc@latest/+esm";
import { parseXml } from "https://cdn.jsdelivr.net/npm/@biblioteksentralen/xml-utils@latest/+esm";

const xmlInput = document.getElementById("marcXmlInput");
const outputDiv = document.getElementById("output");
const lineMarcOutput = document.getElementById("lineMarcOutput");
const errorDiv = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");
const highlightingRadios = document.querySelectorAll(
  'input[name="highlighting"]'
);

const outputData = {};

// Load saved highlighting preference from localStorage
function loadHighlightingPreference() {
  const savedPreference =
    localStorage.getItem("marcHighlighting") || "disabled";
  const radioToCheck = document.querySelector(
    `input[name="highlighting"][value="${savedPreference}"]`
  );
  if (radioToCheck) {
    radioToCheck.checked = true;
  }
}

// Save highlighting preference to localStorage
function saveHighlightingPreference(value) {
  localStorage.setItem("marcHighlighting", value);
}

function hideMessages() {
  outputDiv.classList.add("hidden");
  errorDiv.classList.add("hidden");
}

function showError(message) {
  hideMessages();
  errorMessage.textContent = message;
  errorDiv.classList.remove("hidden");
}

function showOutput() {
  hideMessages();
  const highlightingEnabled =
    document.querySelector('input[name="highlighting"]:checked').value ===
    "enabled";

  if (highlightingEnabled) {
    lineMarcOutput.innerHTML = outputData.highlightedText;
  } else {
    lineMarcOutput.textContent = outputData.plainText;
  }

  outputDiv.classList.remove("hidden");
}

async function convertRecordToLineMarc(recordElement) {
  const [marcRecord] = await parseMarcXml(recordElement);
  return await serializeLineMarc(marcRecord);
}

function findMarcNodes(rootNode) {
  if (rootNode.name === "record") {
    return [rootNode];
  }

  const sruRecordsNode = rootNode.first("records");
  if (sruRecordsNode) {
    return (
      sruRecordsNode
        .children("record")
        ?.map((r) => r.first("recordData")?.first("record"))
        .filter(Boolean) ?? []
    );
  }

  const oaiPmhRecordsNode =
    rootNode.first("ListRecords") ?? rootNode.first("GetRecord");
  if (oaiPmhRecordsNode) {
    return (
      oaiPmhRecordsNode
        .children("record")
        .map((r) => r.first("metadata")?.first("record"))
        .filter(Boolean) ?? []
    );
  }
  return [];
}

let debounceTimer;
async function handleInputChange() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const xmlText = xmlInput.value.trim();

    if (!xmlText) {
      hideMessages();
      return;
    }

    try {
      const rootNode = await parseXml(xmlText);

      const marcRecordNodes = findMarcNodes(rootNode);
      if (!marcRecordNodes.length) {
        throw new Error("No MARC record found in the XML");
      }

      let lineMarcResults = [];
      for (const marcRecordNode of marcRecordNodes) {
        const lineMarcText = await convertRecordToLineMarc(marcRecordNode);
        lineMarcResults.push(lineMarcText);
      }

      const combinedOutput = lineMarcResults.join("");
      const highlightedText = combinedOutput.replace(
        /(\$[a-zA-Z0-9])/g,
        ' <span class="text-green-600">$1</span> '
      );

      outputData.plainText = combinedOutput;
      outputData.highlightedText = highlightedText;
      showOutput();
    } catch (error) {
      console.error(error);
      showError(error.message);
    }
  }, 300);
}

loadHighlightingPreference();

xmlInput.addEventListener("input", handleInputChange);
xmlInput.addEventListener("paste", handleInputChange);

highlightingRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    saveHighlightingPreference(this.value);
    if (!outputDiv.classList.contains("hidden")) {
      showOutput();
    }
  });
});
