const wordInputField = document.getElementById("wordInput");
const form = document.getElementById("form");
const errorMessage = document.getElementById("errorMessage");
errorMessage.hidden = true;

const homePage = document.getElementById("homePage");
const definitionPage = document.getElementById("definitionPage");
definitionPage.hidden = true;

const wordElement = document.getElementById("wordText");
const partOfSpeechElement = document.getElementById("partOfSpeechText");
const meaningElement = document.getElementById("meaningText");
const exampleElement = document.getElementById("exampleText");

const nextButton = document.getElementById("nextButton");
const prevButton = document.getElementById("prevButton");   
const backButton = document.getElementById("backButton");
nextButton.addEventListener("click", () => displayDefinition(true));
prevButton.addEventListener("click", () => displayDefinition(false));
backButton.addEventListener("click", () => init());

let definitionObjects = [];
let currentDefinitionCount = -1;


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    init();
    let word = wordInputField.value;
    let data = await getApiData(word);
    if(!data) {
        return;
    }

    let meanings = data[0].meanings;
    for (const meaning of meanings) {
        for (const definition of meaning.definitions) {
            if(definition.example) {
                let wordData = {partOfSpeech: meaning.partOfSpeech, meaning: definition.definition, example: definition.example};
                definitionObjects.push(wordData);  
            }
            else {
                let wordData = {partOfSpeech: meaning.partOfSpeech, meaning: definition.definition};
                definitionObjects.push(wordData);
            }
        }
    }

    displayDefinition(true);
});
        
async function getApiData(word) {
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    let response = await fetch(url);

    if(!response.ok) {
        errorMessage.hidden = false;
        return null;
    }

    let data = await response.json();
    return data;
}

function init() {
    homePage.hidden = false;
    definitionPage.hidden = true;
    errorMessage.hidden = true;
    nextButton.disabled = false;
    prevButton.disabled = false;
    definitionObjects = [];
    currentDefinitionCount = -1;
}

function displayDefinition(next) {
    homePage.hidden = true;
    definitionPage.hidden = false;

    if(definitionObjects.length === 1) {
        nextButton.disabled = true;
        prevButton.disabled = true;
    }
    else if(next) {
        if(currentDefinitionCount === definitionObjects.length - 1) {
            currentDefinitionCount = 0;
        }
        else {
            currentDefinitionCount++;
        }
    }
    else {
        if(currentDefinitionCount === 0) {
            currentDefinitionCount = definitionObjects.length - 1;
        }
        else {
            currentDefinitionCount--;
        }
    }

    let wordData = definitionObjects[currentDefinitionCount];

    wordText.innerText = `Word: ${wordInputField.value}`
    partOfSpeechElement.innerText = `Part of speech: ${wordData.partOfSpeech}`;
    meaningElement.innerText = `Meaning ${currentDefinitionCount + 1}: ${wordData.meaning}`;
    if(wordData.example) {
        exampleElement.innerText = `Example: ${wordData.example}`;
    }
    else{
        exampleElement.innerText = '';
    }
}