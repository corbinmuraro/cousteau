var ignoreList = [
	"the",
	"and",
	"have",
	"that",
	"this",
	"what",
	"were",
	"are",
	"was",
	"has",
	"than",
	"with",
	"from",
	"for",
	"about",
	"will",
	"would",
	"there",
	"you"
];
var jsonObject = {
	wordArray : [],
	fromLang : "",	// THESE VALUES SHOULD GET FILLED BY setLanguage() 
	toLang : ""		// function at bottom of file, if they don't, ERROR
};
var textNodes = [];


findText();


// uses jquery to find text on page and adds it to textNodes
function findText()
{
	console.log('findtext');

	$( "p" ).each(function( index ) {
		var paragraph = $( this ).text();
		if (wordCount($( this ).text()) > 20)
		{
			textNodes.push($( this ).text());
		}
	});

	pickWords();
}

// picks words to translate
// builds the javascript array wordArray with all the words,
// leaving the translated strings empty
function pickWords()
{
	console.log('pickwords');

	console.log(textNodes.length);
	for (var i = 0; i < textNodes.length; i++)
	{
		// splits string into array of word strings
		var stringArray = textNodes[i].split(" ");

		var j = Math.floor(Math.random() * 15) + 2;
		while (j < stringArray.length)
		{
			// TODO: make translation snippets randomly varied in word length, don't cut across sentences
			// 		 at some point, make snippets logical phrases for better translation
			// 		 (e.g. "and then he said" instead of "cat and then")
			var wordToTranslate = stringArray[j];
			if (validate(wordToTranslate))
			{
				var item = {
					untranslated : wordToTranslate,
					translated : ""
				};

				jsonObject.wordArray.push(item);
			}

			j += Math.floor(Math.random() * 90) + 80;
		}
	}

	loadLangs();
}

// if there's nothing found to translate, don't go any further
// otherwise, pull languages from chrome storage and call ajax
function loadLangs() 
{
	if (jsonObject.wordArray.length)
	{
		console.log('loadlangs');
		chrome.storage.sync.get({
			from: 'en',
			to: 'es',
		}, function(items) {
			console.log('setting lang');
			jsonObject.fromLang = items.from;
			jsonObject.toLang = items.to;
			getTranslation();
		});
	}
}

// ARGUMENTS: a javascript object
// communicates with the server, adds translated text to jsonObject
// CALLBACK: replaceWords
function getTranslation() 
{
	console.log('ajax call');

	$.ajax({
		type: 'POST',
		url: 'https://languageimmersion.tk:8888',
		data: JSON.stringify(jsonObject),
		contentType: 'application/json',
		dataType: "json",
		success: replaceWords,
		error: function (xhr, status, error) {
			console.log('Error: ' + error.message);
		}
	});
}

// loops through json object returned, calling replaceInDOM on each
function replaceWords(translatedArray)
{	
	for (var j = 0; j < translatedArray.length; j++)
	{
		replaceInDOM(translatedArray[j].untranslated, translatedArray[j].translated);
	}

	var arrLength = translatedArray.length.toString();
	console.log('about to send message');
	chrome.runtime.sendMessage({ type: "updateBadge", length: arrLength });
}

// takes untranslated and translated string
// replaces instances of untranslated with translated on DOM
function replaceInDOM(untranslated, translated)
{
	// TODO: replace one word instead of all instances in <p>

	var regex = new RegExp('\\b' + untranslated + '\\b');

	$("p").html(function(i, text) {
		return text.replace(" " + untranslated, "<span style='background-color: #FFFF00'>" + " " + translated + "</span>");
	});
}

// ARGUMENTS: a string
// RETURNS: the number of words in the string
function wordCount(str) 
{ 
	return str.split(" ").length;
}


// returns valid if word has no strange characters
// 				 and isn't an ignored word
// 				 and isn't 2 characters or shorter
// TODO: clean up the code by making it all regex
function validate(word)
{
	if (word.length < 3)
		return false;

	for (var i = 0; i < ignoreList.length; i++)
	{
		if (word == ignoreList[i])
			return false;
	}

	var re = new RegExp("^[a-z?!.,'’-]+$");
	if (!re.test(word)) // false if numbers or special characters. This only works for LATIN languages
	{
		console.log("INVALD " + word);
		return false;
	}
	else
	{
		console.log("VALID " + word);
	}

	return true;
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// WEB SOCKET translation function
// %%%%%%%%%%%%%%%%%
// function getTranslation(arr, pos, snippet)
// {
// 		console.log(arr + "   " + pos + "   " + snippet);

// 		socket.emit('pre-translate', {
// 			value: snippet,
// 			from: fromLang,
// 			to: toLang
// 		});

// 		socket.on('post-translate', function(translatedText){
// 			// this logic only works for single word phrases
// 			console.log(arr);
// 			console.log(pos);
// 			console.log(translatedText.value);
// 			arr[pos] = translatedText.value;
// 			// console.log(arr);
// 		});
// }
