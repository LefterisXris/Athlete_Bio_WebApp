'use strict';

/* **************
*** Constants ***
*****************/

const ATHLETE_KEY = 'player';

/* ********************
*** Service Workers ***
***********************/

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function (error) {
        console.log('Registration failed with ' + error);
    });
}

/* ****************
*** Handle A2HS ***
*******************/

// Handle A2HS
let deferredPrompt;
const installBtn = document.getElementById('install');

/* ************
*** Generic ***
***************/

/**
 * Creates an HTML table row (tr) containing all the data of the provided array.
 * The generated row may contain either table-header (th) or table-data (td) elements
 * @param dataArr The array with the data
 * @param rowElement tr | td
 * @returns {HTMLTableRowElement} the generated html row (tr element)
 */
function createTableRow(dataArr, rowElement) {
    const row = document.createElement('tr');
    for (let cellValue of dataArr) {
        const cellElem = document.createElement(rowElement);
        cellElem.innerHTML = cellValue;
        row.appendChild(cellElem);
    }
    return row;
}

/**
 * Creates an HTML table row (tr) containing all the header data (th) of the provided array
 * @param headerDataArr The array with the header data
 * @returns {HTMLTableRowElement} the generated html row (tr element with th data)
 */
function createTableHeaderRow(headerDataArr) {
    const headerRow = createTableRow(headerDataArr[0], 'th');

    // Add the context menu listener for show/hide columns functionality
    headerRow.addEventListener('contextmenu', function showHeaderContextMenu(e) {
        const table = headerRow.closest('table');
        generateContextMenu(headerDataArr, e.clientX, e.clientY, table.id);
        e.preventDefault();
    }, false);

    return headerRow;
}

/**
 * Creates an HTML table row (tr) containing all the data (td) of the provided array
 * @param rowDataArr The array with the data
 * @returns {HTMLTableRowElement} the generated html row (tr element with td data)
 */
function createTableDataRow(rowDataArr) {
    return createTableRow(rowDataArr, 'td');
}

function toggleHeaderClass(th) {
    const sortAttr = th.getAttribute('sortBy') + '';
    // remove the symbol from all siblings
    th.closest('table')
        .querySelectorAll('th')
        .forEach(sibling => sibling.removeAttribute('sortBy'));

    // toggle the current
    if (sortAttr === 'asc') {
        th.setAttribute('sortBy', 'desc');
    } else if (sortAttr === 'desc') {
        th.removeAttribute('sortBy');
    } else { // if it is none or does not exist
        th.setAttribute('sortBy', 'asc');
    }
}

function clone(data) {
    return JSON.parse(JSON.stringify(data));
}

/* ****************
 *** Statistics ***
 ******************/

// Statistics data
const statsHeaders = [
    ['Statistic', 'Value'],
    [true, true],
    ['text', 'numeric']
];
const statsDataArray = [];

/**
 * Populates the athlete's basic info
 */
function populateBasicInfo() {
    const basicInfo = db().basicInfo;

    document.getElementById('fullName').innerText = basicInfo.name;
    document.getElementById('player-img').src = basicInfo.image.src;
    document.getElementById('player-img').alt = basicInfo.image.alt;
    document.getElementById('country-flag-img').src = basicInfo.countryImage.src;
    document.getElementById('country-flag-img').alt = basicInfo.countryImage.alt;


    document.getElementById('height').innerText = basicInfo.height + 'cm';
    document.getElementById('weight').innerText = basicInfo.weight + 'kg';

    const date = new Date(basicInfo.birth); // TODO: format the date to smth like: 12 August 1998
    document.getElementById('birth').innerText = basicInfo.birth;
    document.getElementById('rank').innerText = basicInfo.rank;
    document.getElementById('gameStyle').innerText = basicInfo.gameStyle;

    const winRateArr = basicInfo.winRate.split('/');
    const games = parseInt(winRateArr[0]);
    const wins = parseInt(winRateArr[1]);
    const ratio = parseFloat(100 * wins / games + '').toPrecision(2);
    document.getElementById('winRate').innerText = `${ratio}% (${basicInfo.winRate})`;

    document.getElementById('bio-1').innerHTML = db().biographyTexts[0];
    document.getElementById('bio-2').innerHTML = db().biographyTexts[1];
    document.getElementById('bio-3').innerHTML = db().biographyTexts[2];

    document.getElementById('fb-link').setAttribute('href', db().social.facebook);
    document.getElementById('twitter-link').setAttribute('href', db().social.twitter);
    document.getElementById('youtube-link').setAttribute('href', db().social.youtube);
    document.getElementById('instagram-link').setAttribute('href', db().social.instagram);

}

/**
 * Populates the table related with Statistics
 */
function populateStatsTable() {

    // retrieve stats data from localStorage
    Object.entries(db().statistics).forEach(entry => statsDataArray.push(entry));
    const statsTable = document.getElementById('stats-table');

    // Populate headers
    const statsHead = document.createElement('thead');
    statsHead.appendChild(createTableHeaderRow(statsHeaders));
    statsTable.appendChild(statsHead);

    // Add the left click listener for sorting functionality
    const origData = clone(statsDataArray);
    statsTable.querySelectorAll('th').forEach(th => th.addEventListener('mouseup', function onSortRequested(e) {
        if (e.button !== 0 || isCtxMenuOpen())
            return;
        toggleHeaderClass(th);
        if (th.getAttribute('sortBy') == null) {
            statsDataArray.length = 0
            origData.forEach(dt => statsDataArray.push(dt));
            console.log(`Reset sorting in table ${statsTable.id}`);
        } else {
            sortData(statsTable.id, statsDataArray, statsHeaders, th);
        }

        statsTable.querySelector('tbody').remove();
        popStatTable(statsTable);
    }, false));

    // Populate data
    popStatTable(statsTable);
}

function popStatTable(statsTable) {
    const statsBody = document.createElement('tbody');
    for (let i = 0; i < statsDataArray.length; i++) {
        const row = createTableDataRow(statsDataArray[i])
        statsBody.appendChild(row);
    }
    statsTable.appendChild(statsBody);
    applyShowHide(statsTable.id, statsHeaders);
}

function applyShowHide(tableId, headerArray) {
    for (let i = 0; i < headerArray[1].length; i++) {
        if (headerArray[1][i])
            showColumn(tableId, i);
        else
            hideColumn(tableId, i);
    }
}

/* *************
*** Activity ***
****************/

// Activity data
const activitiesHeaders = [
    ['Tournament', 'Location', 'Participants', 'Games', 'W-L', 'Preview'],
    [true, true, true, true, true, true],
    ['text', 'text', 'numeric', 'numeric', 'numeric', 'none']
];
const activitiesDataArray = [];
const activitiesPreviewData = [];

/**
 * Prepares the HTML element that should be placed on the 'preview' cell of the activities data.
 * This has to be performed prior to activities table population as it is not included on the
 * initial data. This function 'adds' the generated preview html to the data array.
 */
function prepareActivitiesPreviewData() {
    // retrieve tournaments meta-data from localStorage
    if (activitiesPreviewData.length === 0)
        db().tournamentsMeta.forEach(entry => activitiesPreviewData.push(entry));

    if (activitiesDataArray.length !== activitiesPreviewData.length) {
        alert('A mismatch identified on Activities data. Render might fail');
    }

    if (activitiesDataArray[0].length === 6)
        return; // already done

    for (let i = 0; i < activitiesPreviewData.length; i++) {
        const previewImg = document.createElement('img');
        previewImg.setAttribute('class', 'preview');
        previewImg.setAttribute('src', 'img/vs-matches.png');
        previewImg.setAttribute('alt', 'vs-matches');

        const moreDiv = document.createElement('div');
        moreDiv.setAttribute('class', 'preview-more');
        const moreImg = document.createElement('img');
        moreImg.src = activitiesPreviewData[i][0];
        // moreImg.setAttribute('src', 'img/tournaments/' + activitiesPreviewData[i][0]);
        moreImg.setAttribute('alt', activitiesPreviewData[i][1]);
        const decrDiv = document.createElement('div');
        decrDiv.setAttribute('class', 'preview-desc');
        decrDiv.innerHTML = activitiesPreviewData[i][2];

        moreDiv.appendChild(moreImg);
        moreDiv.appendChild(decrDiv);

        const wrapper = document.createElement('div');
        wrapper.appendChild(previewImg);
        wrapper.appendChild(moreDiv);
        activitiesDataArray[i].push(wrapper.innerHTML);
    }
}

/**
 * Populates the table related with Activities
 */
function populateActivitiesTable() {

    // retrieve tournaments data from localStorage
    db().tournaments.forEach(entry => activitiesDataArray.push(entry));
    const activitiesTable = document.getElementById('activity-table');

    // Populate headers
    const activitiesHead = document.createElement('thead');
    activitiesHead.appendChild(createTableHeaderRow(activitiesHeaders));
    activitiesTable.appendChild(activitiesHead);

    const origData = clone(activitiesDataArray);
    // Add the left click listener for sorting functionality
    activitiesTable.querySelectorAll('th').forEach(th => th.addEventListener('mouseup', function onSortRequested(e) {
        if (e.button !== 0 || isCtxMenuOpen())
            return;
        if (activitiesHeaders[2][th.cellIndex] !== 'none')
            toggleHeaderClass(th);

        if (th.getAttribute('sortBy') == null) {
            activitiesDataArray.length = 0
            origData.forEach(dt => activitiesDataArray.push(dt));
            prepareActivitiesPreviewData();
            console.log(`Reset sorting in table ${activitiesTable.id}`);
        } else {
            sortData(activitiesTable.id, activitiesDataArray, activitiesHeaders, th);
        }

        activitiesTable.querySelector('tbody').remove();
        popActivityData(activitiesTable);
    }, false));

    // add filters handler
    const applyFilterFunc = function applyFilter(e, filter) {
        // dispose the modal
        document.getElementById('tournamentFilterModal').style.display = 'none';
        // reset the data
        activitiesDataArray.length = 0
        origData.forEach(dt => activitiesDataArray.push(dt));
        prepareActivitiesPreviewData();
        activitiesTable.querySelector('tbody').remove();

        // set the filter
        let filtersStr = activitiesTable.getAttribute('filters');
        if (filtersStr == null)
            filtersStr = '';
        const filters = filtersStr.split(',');
        if (filter != null) {
            filters.push(filter);
            activitiesTable.setAttribute('filters', filters.join(','));
        } else {
            activitiesTable.removeAttribute('filters');
        }

        // re-render
        popActivityData(activitiesTable);
        if (filter != null)
            document.getElementById('apply-filter-tournament').innerText = 'Filter: ' + document.getElementById(filter).innerText;
        else
            document.getElementById('apply-filter-tournament').innerText = 'Apply Filters on Table';
    };
    document.getElementById('currentYear2').addEventListener('click', function (e) {
        applyFilterFunc(e, 'currentYear2');
    });
    document.getElementById('lessThan30').addEventListener('click', function applyFilter1(e, x) {
        applyFilterFunc(e, 'lessThan30');
    });
    document.getElementById('clear2').addEventListener('click', function applyFilter1(e) {
        applyFilterFunc(e, null);
    });
    document.getElementById('cancel2').addEventListener('click', function cancelModal(e) {
        document.getElementById('tournamentFilterModal').style.display = 'none';
    });

    // Populate data
    prepareActivitiesPreviewData();
    popActivityData(activitiesTable);
}

function popActivityData(activitiesTable,) {
    const activitiesBody = document.createElement('tbody');
    const filters = activitiesTable.getAttribute('filters');
    for (let i = 0; i < activitiesDataArray.length; i++) {
        if (filters != null && filters !== '') {
            let shouldSkip = false;
            filters.split(',').forEach(filter => {
                switch (filter) {
                    case 'currentYear2':
                        if (!activitiesDataArray[i][1].includes(new Date().getFullYear() + ''))
                            shouldSkip = true;
                        break;
                    case 'lessThan30':
                        if (parseInt(activitiesDataArray[i][2]) > 30)
                            shouldSkip = true;
                        break;
                }
            });
            if (shouldSkip)
                continue;
        }
        const row = createTableDataRow(activitiesDataArray[i])
        activitiesBody.appendChild(row);
    }
    activitiesTable.appendChild(activitiesBody);
    applyShowHide(activitiesTable.id, activitiesHeaders);
}

/* *************
*** Evolution ***
****************/

// Evolution data
const evolutionHeaders = [
    ['Date (Quarter)', 'Ranking'],
    [true, true],
    ['text', 'html']
];
const evolutionDataArray = [];

/**
 * Prepares the HTML element that should be placed on the 'ranking' cell of the evolution data.
 * This has to be performed prior to evolution table population as it is not included on the
 * initial data. This function 'adds' the generated progress html to the data array.
 */
function prepareEvolutionProgressData() {

    if (evolutionDataArray[0][1].includes('</div>'))
        return; // already performed
    for (let i = 0; i < evolutionDataArray.length; i++) {

        const rank = document.createElement('div');
        rank.innerHTML = evolutionDataArray[i][1];

        const progress = document.createElement('div');
        progress.setAttribute('class', 'progress');

        // check the progress based on previous item (the next in the array)
        if (i + 1 < evolutionDataArray.length) {

            const places = evolutionDataArray[i + 1][1] - evolutionDataArray[i][1];
            let cls, progrStr;
            if (places > 0) {
                cls = 'up';
                progrStr = `(+ ${places})`
            } else if (places < 0) {
                cls = 'down';
                progrStr = `(- ${Math.abs(places)})`
            } else {
                cls = 'same';
            }
            rank.setAttribute('class', cls);

            if (progrStr)
                progress.innerHTML = progrStr;
        }

        const wrapper = document.createElement('div');
        wrapper.appendChild(rank);
        wrapper.appendChild(progress);

        // remove the last item which is just the ranking, and add the complete html element
        evolutionDataArray[i].pop();
        evolutionDataArray[i].push(wrapper.innerHTML);
    }
}

/**
 * Populates the table related with Evolution
 */
function populateEvolutionTable() {

    // retrieve ranking evolution data from localStorage
    db().rankingEvolution.forEach(entry => evolutionDataArray.push(entry));
    const evolutionTable = document.getElementById('evolution-table');

    // Populate headers
    const evolutionHead = document.createElement('thead');
    evolutionHead.appendChild(createTableHeaderRow(evolutionHeaders));
    evolutionTable.appendChild(evolutionHead);

    // Add the left click listener for sorting functionality
    const origData = clone(evolutionDataArray);
    evolutionTable.querySelectorAll('th').forEach(th => th.addEventListener('mouseup', function onSortRequested(e) {
        if (e.button !== 0 || isCtxMenuOpen())
            return;
        toggleHeaderClass(th);
        if (th.getAttribute('sortBy') == null) {
            evolutionDataArray.length = 0
            origData.forEach(dt => evolutionDataArray.push(dt));
            prepareEvolutionProgressData();
            console.log(`Reset sorting in table ${evolutionTable.id}`);
        } else {
            sortData(evolutionTable.id, evolutionDataArray, evolutionHeaders, th);
        }

        evolutionTable.querySelector('tbody').remove();
        popEvolutionData(evolutionTable);
    }, false));

    // add filters handler
    const applyFilterFunc = function applyFilter(e, filter) {
        // dispose the modal
        document.getElementById('evolutionFilterModal').style.display = 'none';
        // reset the data
        evolutionDataArray.length = 0
        origData.forEach(dt => evolutionDataArray.push(dt));
        prepareEvolutionProgressData();
        evolutionTable.querySelector('tbody').remove();

        // set the filter
        let filtersStr = evolutionTable.getAttribute('filters');
        if (filtersStr == null)
            filtersStr = '';
        const filters = filtersStr.split(',');
        if (filter != null) {
            filters.push(filter);
            evolutionTable.setAttribute('filters', filters.join(','));
        } else {
            evolutionTable.removeAttribute('filters');
        }

        // re-render
        popEvolutionData(evolutionTable);
        if (filter != null)
            document.getElementById('apply-filter-evolution').innerText = 'Filter: ' + document.getElementById(filter).innerText;
        else
            document.getElementById('apply-filter-evolution').innerText = 'Apply Filters on Table';
    };

    document.getElementById('currentYear').addEventListener('click', function applyFilter1(e) {
        applyFilterFunc(e, 'currentYear');
    });
    document.getElementById('year2017').addEventListener('click', function applyFilter2(e) {
        applyFilterFunc(e, 'year2017');
    });
    document.getElementById('moreThan20').addEventListener('click', function applyFilter3(e) {
        applyFilterFunc(e, 'moreThan20');
    });
    document.getElementById('negative').addEventListener('click', function applyFilter3(e) {
        applyFilterFunc(e, 'negative');
    });
    document.getElementById('clear').addEventListener('click', function clearFilter(e) {
        applyFilterFunc(e, null);
    });
    document.getElementById('cancel').addEventListener('click', function cancelModal(e) {
        document.getElementById('evolutionFilterModal').style.display = 'none';
    });

    // Populate data
    prepareEvolutionProgressData();
    popEvolutionData(evolutionTable);
}

function popEvolutionData(evolutionTable) {
    const evolutionBody = document.createElement('tbody');
    const filters = evolutionTable.getAttribute('filters');
    for (let i = 0; i < evolutionDataArray.length; i++) {

        if (filters != null && filters !== '') {
            let shouldSkip = false;
            filters.split(',').forEach(filter => {
                switch (filter) {
                    case 'year2017':
                        if (!evolutionDataArray[i][0].startsWith('2017'))
                            shouldSkip = true;
                        break;
                    case 'currentYear':
                        if (!evolutionDataArray[i][0].startsWith(new Date().getFullYear() + ''))
                            shouldSkip = true;
                        break;
                    case 'moreThan20':
                        const tmpElem1 = document.createElement('div');
                        tmpElem1.innerHTML = evolutionDataArray[i][1];

                        if (!tmpElem1.querySelector('div:first-child').classList.contains('up')
                            || parseInt(tmpElem1.querySelector('div:last-child').innerText
                                .replace('(+ ', '').replace(')', '')) <= 20) {
                            shouldSkip = true;
                        }
                        break;
                    case 'negative':
                        const tmpElem2 = document.createElement('div');
                        tmpElem2.innerHTML = evolutionDataArray[i][1];
                        if (!tmpElem2.querySelector('div:first-child').classList.contains('down')) {
                            shouldSkip = true;
                        }
                        break;
                }
            });
            if (shouldSkip)
                continue;
        }
        const row = createTableDataRow(evolutionDataArray[i])
        evolutionBody.appendChild(row);
    }
    evolutionTable.appendChild(evolutionBody);
    applyShowHide(evolutionTable.id, evolutionHeaders);
}

// Show Hide functionality

/**
 * Hides a specific column from the provided table
 * @param tableId The id of the table that the column belongs to
 * @param columnIndex the index of column in the table
 */
function hideColumn(tableId, columnIndex) {
    columnIndex++; // column indexing starts at 0
    const nodes = document.querySelectorAll(`#${tableId} tr td:nth-child(${columnIndex}), #${tableId} tr th:nth-child(${columnIndex})`);
    nodes.forEach(node => node.setAttribute('hidden', 'true'));
    // console.log(`Hiding column '${columnIndex}' from table '${tableId}'`);
}

/**
 * Shows a specific column from the provided table
 * @param tableId The id of the table that the column belongs to
 * @param columnIndex the index of column in the table
 */
function showColumn(tableId, columnIndex) {
    columnIndex++;
    const nodes = document.querySelectorAll(`#${tableId} tr td:nth-child(${columnIndex}), #${tableId} tr th:nth-child(${columnIndex})`);
    nodes.forEach(node => node.removeAttribute('hidden'));
    // console.log(`Showing column '${columnIndex}' from table '${tableId}'`);
}

/**
 * Clears the data and hides the contextMenu
 */
function clearCtxMenu() {
    const ctxMenu = document.getElementById("ctxMenu");
    if (ctxMenu) {
        setTimeout(function hideContextMenu(e) {
            ctxMenu.innerHTML = '';
            ctxMenu.style.visibility = 'hidden';
        }, 50);
    }
}

function isCtxMenuOpen() {
    return document.getElementById('ctxMenu').innerHTML !== '';
}

/**
 * Populates the contextMenu with the provided data
 */
function generateContextMenu(headerArray, x, y, tableId) {
    const ctxMenu = document.getElementById('ctxMenu');
    ctxMenu.innerHTML = '';

    for (let i = 0; i < headerArray[0].length; i++) {
        const headerItem = headerArray[0][i];

        const contextRow = document.createElement('div');

        const chBox = document.createElement('input');
        chBox.setAttribute('type', 'checkbox');
        chBox.setAttribute('id', 'chBox-' + headerItem);
        chBox.setAttribute('colIndex', '' + i);
        if (headerArray[1][i])
            chBox.setAttribute('checked', 'true');
        else
            chBox.removeAttribute('checked');

        const item = document.createElement('label');
        item.setAttribute('for', 'chBox-' + headerItem);
        item.innerHTML = headerItem;

        contextRow.appendChild(chBox);
        contextRow.appendChild(item);

        // CheckBox listener
        chBox.addEventListener('change', function onCheckBoxChange(e) {
            if (this.checked) {
                headerArray[1][i] = true;
                showColumn(tableId, this.getAttribute('colIndex'));
            } else {
                headerArray[1][i] = false;
                hideColumn(tableId, this.getAttribute('colIndex'));
            }

            // if all columns are hidden, hide the table and enable the 'reset' button
            if (headerArray[1].every(v => v === false)) {
                const table = document.getElementById(tableId);
                table.setAttribute('hidden', 'true');

                const resetBtn = document.createElement('button');
                resetBtn.innerHTML = 'Reset table columns';
                resetBtn.setAttribute('class', 'resetButton');
                resetBtn.addEventListener('click', function resetColumns(e) {
                    table.removeAttribute('hidden');
                    document.querySelectorAll(`#${tableId} th`).forEach(th => {
                        showColumn(tableId, th.cellIndex);
                    });
                    for (let j = 0; j < headerArray[1].length; j++) {
                        headerArray[1][j] = true;
                    }
                    resetBtn.remove();
                }, false);

                table.parentElement.appendChild(resetBtn);
                clearCtxMenu();
            }
        }, false);

        ctxMenu.appendChild(contextRow);
    }

    const menuStyle = ctxMenu.style;
    menuStyle.top = y + 'px';
    menuStyle.left = x + 'px';
    menuStyle.visibility = 'visible';
}

/**
 * Adds a listener to the document that checks whether the contextMenu should be visible or not
 */
function prepareShowHideFunctionality() {
    document.addEventListener('click', function disposeContextMenuOnClick(e) {
        if (e.button !== 0 || e.target.closest('#ctxMenu') != null)
            return; // context menu is clicked, thus no action is required
        clearCtxMenu();
    }, false);

    document.addEventListener('keydown', function disposeContextMenuOnEsc(e) {
        if (e.code === 'Escape') {
            clearCtxMenu();
            document.getElementById('tournamentFilterModal').style.display = 'none';
            document.getElementById('evolutionFilterModal').style.display = 'none';
        }
    }, false);
}

function sortData(tableId, dataArr, headerArr, th) {

    const desc = th.getAttribute('sortBy') === 'desc';
    const colIndex = th.cellIndex;

    let compareFn;
    switch (headerArr[2][colIndex]) {
        case 'numeric':
            compareFn = (a, b) => a[colIndex] - b[colIndex];
            break;
        case 'text':
            compareFn = (a, b) => ('' + a[colIndex]).localeCompare('' + b[colIndex]);
            break;
        case 'html':
            compareFn = (a, b) => {
                const tmpElem1 = document.createElement('div');
                tmpElem1.innerHTML = a[colIndex];
                const tmpElem2 = document.createElement('div');
                tmpElem2.innerHTML = b[colIndex];
                return tmpElem1.querySelector('div:first-child').innerText - tmpElem2.querySelector('div:first-child').innerText;
            }
            break;
        case 'none':
        case '':
            return; // no sort
    }
    console.log(`Sorting table '${tableId}' on column '${th.innerText}' in '${desc ? 'desc' : 'asc'}' mode comparing ${headerArr[2][colIndex]}`);
    dataArr.sort((a, b) => compareFn(a, b));
    if (desc)
        dataArr.reverse();
}

function db() {
    return JSON.parse(localStorage.getItem(ATHLETE_KEY));
}

function registerListeners() {
    window.addEventListener('beforeinstallprompt', function (ev) {
        // Prevent some older browsers from popping the install prompt
        ev.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = ev;
        // Update UI to notify the user they can add to home screen
        installBtn.style.visibility = 'visible';

        installBtn.addEventListener('click', function () {
            // Show the prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then(function (choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    // Don't need it any more
                    installBtn.style.visibility = 'hidden';
                    deferredPrompt = null;
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
            });
        });
    });

    window.addEventListener('appinstalled', function () {
        installBtn.style.visibility = 'hidden';
        deferredPrompt = null;
        console.log('PWA was installed');
    });

    document.getElementById('edit-data').addEventListener('click', function editApplicationData(e) {
        if (confirm('This feature is not available in the free version. Upgrade to Pro version to get it!')) {
            alert('Just joking :) There is no Pro version. Thanks for your curiosity though..');
        }
    });

    document.getElementById('new-athlete').addEventListener('click', function clearApplicationData(e) {
        if (confirm('To insert new data, the current Athlete\'s data will be deleted. Are you sure? Action can not be reverted')) {
            localStorage.clear();
            location.reload();
        }
    });

    document.getElementById('load-data').addEventListener('click', function loadDataFromFile(e) {
        if (confirm('To load data, the current Athlete\'s data will be deleted. Are you sure? Action can not be reverted')) {
            const input = document.createElement('input');
            input.setAttribute("type", "file");
            input.setAttribute("accept", ".json");
            input.addEventListener('change', async function loadFile() {
                let file = this.files.item(0)
                const txt = await file.text();
                localStorage.setItem(ATHLETE_KEY, txt);
                location.reload();
            });
            input.click();
        }
    });

    document.getElementById('apply-filter-tournament').addEventListener('click', function openModal1(e) {
        document.getElementById('tournamentFilterModal').style.display = 'list-item';
    });

    document.getElementById('apply-filter-evolution').addEventListener('click', function openModal2(e) {
        document.getElementById('evolutionFilterModal').style.display = 'list-item';
    });
}

// Main Execution

// If application hasn't been setup yet, navigate to the setup page
if (db() == null) {
    window.onload = function () {
        window.location.href = "setup.html";
    }
}

registerListeners();
populateBasicInfo();
populateStatsTable();
populateActivitiesTable();
populateEvolutionTable();
prepareShowHideFunctionality();


/*
Done in 2nd iteration:
 - JS Data: All data and tables are populated through JS
 - Auto calc: Auto calculation of ranking diff (per Year quarter) and apply the related style
 - Show/Hide: Context menu on all table headers with options (checkboxes) to show/hide available columns
 - Sort: Sorting options on left click on columns. Toggles asc-desc-none mode
*/

/*
Done in 3rd iteration:
 - PWA (manifest + sw)
 - Dynamic data loading (check for json import/export)
    - Start with a blank page
    - Prompt to insert athlete's name, pic, country-pic, height, weight, birth, rank, win rate and game style
    - Prompt to add text for bio (html text is supported)
    - Prompt to add statistics data (key-value entries)
    - Prompt to add tournament titles data (+ the hover image)
        - Maybe implement dynamic tables? So to add any column?
    - Prompt to add ranking evolution data
    - Prompt to add links for fb, twitter, youtube and insta (optional all)
 - Local storage (all the above data)
 - Filtering options (through a button that opens a modal)
    - Filter tournaments with n of Participants, current year's etc
    - Filter on ranking: show negative, current year's etc
    - Reset filters
    - Cancel/dispose modal)
    - Filtering can be combined with sorting and hiding functionality
 */

