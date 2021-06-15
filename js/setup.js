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
    tournamentsMeta: [],
    rankingEvolution: [],
    social: {
        facebook: null,
        twitter: null,
        youtube: null,
        instagram: null,
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

    let tabs = document.getElementsByClassName("tab");
    tabs[n].style.display = "block";
    // check which buttons should be visible
    if (n === 0) {
        document.getElementById("prevBtn").style.display = "none";
        document.getElementById("loadBtn").style.display = "inline";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
        document.getElementById("loadBtn").style.display = "none";
    }
    if (n === (tabs.length - 1)) {
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
    let tabs = document.getElementsByClassName('tab');

    // if current step is not valid, do nothing
    if (!validateForm())
        return false;

    // Go to the next tab
    tabs[currentTab].style.display = "none";
    currentTab += 1;

    // check if it is the last one, or just show the next tab
    if (currentTab >= tabs.length) {
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
    let tabs = document.getElementsByClassName('tab');

    // Go to the next tab
    tabs[currentTab].style.display = "none";
    currentTab -= 1;

    // check if it is the last one, or just show the next tab
    if (currentTab >= tabs.length) {
        submitForm();
        return false;
    } else {
        showTab(currentTab);
    }
}

/**
 * Navigates the form to the give tab
 */
function jumpToTab(n) {
    let tabs = document.getElementsByClassName('tab');
    tabs[currentTab].style.display = "none";
    currentTab = n;
    showTab(n);
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
    let tabs = document.getElementsByClassName("step");
    for (let i = 0; i < tabs.length; i++)
        tabs[i].className = tabs[i].className.replace(" active", "");
    tabs[n].className += " active";
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

    document.getElementById('save-stat').addEventListener('click', function (e) {

        e.preventDefault();
        e.stopPropagation();

        // Get key-value pair
        const nameElem = document.getElementById('stat-name');
        const valueElem = document.getElementById('stat-value');
        const previewElem = document.getElementById('preview-stat');

        // Persist it
        playerInfo.statistics[nameElem.value.trim()] = valueElem.value.trim()

        // Clear fields for new entries
        clearStatData();
        previewElem.value = Object.keys(playerInfo.statistics)
            .map(key => key + '=' + playerInfo.statistics[key])
            .join(', ');
    });

    document.getElementById('clear-all-stats').addEventListener('click', function (e) {

        e.preventDefault();
        e.stopPropagation();

        playerInfo.statistics = {};
        clearStatData();
    });

    document.getElementById('boardPicker').addEventListener('change', function () {
        let file = this.files.item(0), reader = new FileReader();
        // Android 4.3 not supporting addEventListener + load, loadend etc. events
        let imgElem = document.getElementById('board-img');
        imgElem.value = file.name;
        reader.onload = function () {
            imgElem.src = reader.result;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('save-tournament').addEventListener('click', function (e) {

        e.preventDefault();
        e.stopPropagation();

        // Get data
        const nameElem = document.getElementById('tournament-name');
        const locationElem = document.getElementById('tournament-location');
        const participantsElem = document.getElementById('tournament-participants');
        const gamesElem = document.getElementById('tournament-games');
        const wlElem = document.getElementById('tournament-wl');
        const boardSrcElem = document.getElementById('board-img');
        const boardLabelElem = document.getElementById('tournament-board-lbl');
        const previewElem = document.getElementById('preview-tournament');

        // Persist it
        playerInfo.tournaments.push([
            nameElem.value.trim(),
            locationElem.value.trim(),
            participantsElem.value.trim(),
            gamesElem.value.trim(),
            wlElem.value.trim()
        ]);

        playerInfo.tournamentsMeta.push([
            boardSrcElem.src,
            boardSrcElem.value.trim(),
            boardLabelElem.value.trim()
        ]);

        // Clear fields for new entries
        clearTournamentFields();

        previewElem.value = playerInfo.tournaments.map(entry => entry.join(', '));
    });

    document.getElementById('clear-all-tournaments').addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        playerInfo.tournaments = [];
        playerInfo.tournamentsMeta = [];
        clearTournamentFields();
    });

    document.getElementById('save-ranking').addEventListener('click', function (e) {

        e.preventDefault();
        e.stopPropagation();

        // Get key-value pair
        const dateElem = document.getElementById('date');
        const rankElem = document.getElementById('ranking');
        const previewElem = document.getElementById('preview-ranking');

        // TODO: This can be used for bulk data loading from a CSV value (multiple data)
        /*const dates = dateElem.value.trim().split(',');
        const ranks = rankElem.value.trim().split(',');

        for (let i = 0; i < dates.length; i++) {
            playerInfo.rankingEvolution.push([dates[i].trim(), ranks[i].trim()]);
        }*/

        // Persist it
        playerInfo.rankingEvolution.push([dateElem.value.trim(), rankElem.value.trim()]);

        // Clear fields for new entries
        clearRankingData();
        previewElem.value = playerInfo.rankingEvolution.map(entry => entry.join(', '));
    });

    document.getElementById('clear-all-rankings').addEventListener('click', function (e) {

        e.preventDefault();
        e.stopPropagation();

        playerInfo.rankingEvolution = [];
        clearRankingData();
    });
}

function clearStatData() {
    document.getElementById('stat-name').value = '';
    document.getElementById('stat-value').value = '';
    document.getElementById('preview-stat').value = '';
}

function clearTournamentFields() {
    document.getElementById('tournament-name').value = '';
    document.getElementById('tournament-location').value = '';
    document.getElementById('tournament-participants').value = '';
    document.getElementById('tournament-games').value = '';
    document.getElementById('tournament-wl').value = '';
    document.getElementById('boardPicker').value = '';
    document.getElementById('board-img').value = '';
    document.getElementById('tournament-board-lbl').value = '';
    document.getElementById('preview-tournament').value = '';
}

function clearRankingData() {
    document.getElementById('date').value = '';
    document.getElementById('ranking').value = '';
    document.getElementById('preview-ranking').value = '';
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
