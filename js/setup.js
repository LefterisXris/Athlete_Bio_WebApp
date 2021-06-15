'use strict';

/* **************
*** Constants ***
*****************/

const ATHLETE_KEY = 'player';
let playerInfo = {
    basicInfo: {
        name: null,
        image: {
            src: null,
            alt: null
        },
        countryImage: {
            src: null,
            alt: null
        },
        height: null,
        weight: null,
        birth: null,
        rank: null,
        winRate: null,
        gameStyle: null
    },
    biographyTexts: [],
    statistics: {},
    tournaments: [],
    rankingEvolution: [],
    social: {
        facebook: null,
        twitter: null,
        youtube: null,
        instagram: null,
    }
};

let stefanos = {
    basicInfo: {
        name: 'Stefanos Tsitsipas',
        image: {
            src: null,
            alt: null
        },
        countryImage: {
            src: null,
            alt: null
        },
        height: 193,
        weight: 89,
        birth: '12/08/1998',
        rank: 2,
        winRate: '159/82',
        gameStyle: 'Right Handed'
    },
    biographyTexts: [],
    statistics: {},
    tournaments: [],
    rankingEvolution: [],
    social: {
        facebook: 'https://www.facebook.com/StefTsitsipas',
        twitter: 'https://twitter.com/StefTsitsipas',
        youtube: 'https://www.youtube.com/channel/UCO5HFpRQMOBZvFoHgOneaMQ',
        instagram: 'https://www.instagram.com/stefanostsitsipas98/',
    }
};

let currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab
registerListeners();

/**
 * Marks the provided form's tab as active (i.e. shows it)
 * @param n
 */
function showTab(n) {

    let tab = document.getElementsByClassName("tab");
    tab[n].style.display = "block";
    // check which buttons should be visible
    if (n === 0) {
        document.getElementById("prevBtn").style.display = "none";
        document.getElementById("loadBtn").style.display = "inline";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
        document.getElementById("loadBtn").style.display = "none";
    }
    if (n === (tab.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Next";
    }

    // update the step indicator:
    updateStepIndicator(n)
}

/**
 * Navigates the form to the next tab
 */
function next() {
    let tab = document.getElementsByClassName('tab');

    // if current step is not valid, do nothing
    if (!validateForm())
        return false;

    // Go to the next tab
    tab[currentTab].style.display = "none";
    currentTab += 1;

    // check if it is the last one, or just show the next tab
    if (currentTab >= tab.length) {
        submitForm();
        return false;
    } else {
        showTab(currentTab);
    }
}

/**
 * Navigates the form to the previous tab
 */
function previous() {
    let tab = document.getElementsByClassName('tab');

    // Go to the next tab
    tab[currentTab].style.display = "none";
    currentTab -= 1;

    // check if it is the last one, or just show the next tab
    if (currentTab >= tab.length) {
        submitForm();
        return false;
    } else {
        showTab(currentTab);
    }
}

function loadData() {
    const input = document.createElement('input');
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".json");
    input.addEventListener('change', async function loadFile() {
        let file = this.files.item(0)
        const jsonFileValue = await file.text();
        saveAndRedirect(ATHLETE_KEY, jsonFileValue);
    });
    input.click();
}

function validateForm() {
    // TODO: can be used for form validation
    return true;
}

/**
 * Removes the active class from all steps, and sets it to the currently active one (param)
 */
function updateStepIndicator(n) {
    let i, elem = document.getElementsByClassName("step");
    for (i = 0; i < elem.length; i++)
        elem[i].className = elem[i].className.replace(" active", "");
    elem[n].className += " active";
}

function registerListeners() {

    document.getElementById('imagePicker').addEventListener('change', function () {
        let file = this.files.item(0), reader = new FileReader();
        // Android 4.3 not supporting addEventListener + load, loadend etc. events
        let imgElem = document.getElementById('image');
        reader.onload = function () {
            imgElem.src = reader.result;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('countryImagePicker').addEventListener('change', function () {
        let file = this.files.item(0), reader = new FileReader();
        // Android 4.3 not supporting addEventListener + load, loadend etc. events
        let imgElem = document.getElementById('country-image');
        reader.onload = function () {
            imgElem.src = reader.result;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('save-statistic').addEventListener('click', function (e) {

        // Get key-value pair
        const nameElem = document.getElementById('stat-name');
        const valueElem = document.getElementById('stat-value');

        // Persist it
        playerInfo.statistics[nameElem.value.trim()] = valueElem.value.trim()

        // Clear fields for new entries
    });
}

function submitForm() {
    playerInfo.basicInfo.name = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value
    playerInfo.basicInfo.image.src = document.getElementById('image').src;
    playerInfo.basicInfo.image.alt = document.getElementById('image').value;
    playerInfo.basicInfo.countryImage.src = document.getElementById('country-image').src;
    playerInfo.basicInfo.countryImage.alt = document.getElementById('country-image').value;
    playerInfo.basicInfo.height = parseInt(document.getElementById('height').value);
    playerInfo.basicInfo.weight = parseInt(document.getElementById('weight').value);
    playerInfo.basicInfo.birth = document.getElementById('birth').value;
    playerInfo.basicInfo.rank = parseInt(document.getElementById('rank').value);
    playerInfo.basicInfo.winRate = document.getElementById('winRate').value;
    playerInfo.basicInfo.gameStyle = document.getElementById('gameStyle').value;

    document.querySelectorAll('[id^=bio-]').forEach(textArea => playerInfo.biographyTexts.push(textArea.value));

    playerInfo.social.facebook = document.getElementById('fb-link').value.trim();
    playerInfo.social.twitter = document.getElementById('twitter-link').value.trim();
    playerInfo.social.youtube = document.getElementById('youtube-link').value.trim();
    playerInfo.social.instagram = document.getElementById('instagram-link').value.trim();

    saveAndRedirect(ATHLETE_KEY, JSON.stringify(playerInfo));
}

function saveAndRedirect(key, value) {
    localStorage.setItem(key, value);
    console.log('Saving entry to localStorage. Key: ' + key + ' value: ' + value);
    console.log('Redirecting to WebApplication...');
    window.location.href = "index.html";
}
