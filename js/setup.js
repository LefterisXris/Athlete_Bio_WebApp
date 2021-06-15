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

var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
    // This function will display the specified tab of the form...
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    //... and fix the Previous/Next buttons:
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Generate WebApp";
    } else {
        document.getElementById("nextBtn").innerHTML = "Next";
    }
    //... and run a function that will display the correct step indicator:
    fixStepIndicator(n)
}

function nextPrev(n) {
    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm()) return false;
    // Hide the current tab:
    x[currentTab].style.display = "none";
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // if you have reached the end of the form...
    if (currentTab >= x.length) {
        submitForm();
        return false;
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);
}

function validateForm() {
    return true;
    // This function deals with validation of the form fields
    var x, y, i, valid = true;
    x = document.getElementsByClassName("tab");
    y = x[currentTab].getElementsByTagName("input");
    // A loop that checks every input field in the current tab:
    for (i = 0; i < y.length; i++) {
        // If a field is empty...
        if (y[i].value == "") {
            // add an "invalid" class to the field:
            y[i].className += " invalid";
            // and set the current valid status to false
            valid = false;
        }
    }
    // If the valid status is true, mark the step as finished and valid:
    if (valid) {
        document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    return valid; // return the valid status
}

function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    //... and adds the "active" class on the current step:
    x[n].className += " active";
}

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

    localStorage.setItem(ATHLETE_KEY, JSON.stringify(playerInfo));

    console.log(localStorage.getItem(ATHLETE_KEY));
    alert('LEC:submitted' + localStorage.getItem(ATHLETE_KEY));

    window.location.href = "index.html";
}
