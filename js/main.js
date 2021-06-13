'use strict';

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
const statsDataArray = [
    ['Aces', '1,616'],
    ['Double Faults', '529'],
    ['1st Serve', '62%'],
    ['1st Serve Points Won', '76%'],
    ['2nd Serve Points Won', '54%'],
    ['Break Points Faced', '1,190'],
    ['Break Points Saved', '64%'],
    ['Service Games Played', '3,060'],
    ['Service Games Won', '86%'],
    ['Total Service Points Won', '68%']
];

/**
 * Populates the table related with Statistics
 */
function populateStatsTable() {

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
const activitiesDataArray = [
    ['ATP Masters', 'Monte Carlo, Apr-2021', '56', '5', '5/0'],
    ['Open 13 Provence', 'Marseille, Feb-2020', '28', '4', '4/0'],
    ['Nitto ATP Finals', 'London, Nov-2018', '8', '5', '4/1'],
    ['Estoril', 'Portugal, Apr-2019', '28', '4', '4/0'],
    ['Marseille', 'France, Feb-2019', '28', '4', '4/0'],
    ['Stockholm', 'Sweden, Oct-2018', '28', '4', '4/0']
];
const activitiesPreviewData = [ // image name, tournament description
    ["monte-carlo-2021.svg", "ATP Masters, Monte Carlo, April 2021"],
    ["marseille-2020.svg", "Open 13 Provence, Marseille, February 2020"],
    ["london-2020.svg", "Nitto ATP Finals, London, November 2019"],
    ["estoril-2020.svg", "Estoril Portugal, April 2019"],
    ["marseille-2019.svg", "Marseille France, February 2019"],
    ["stockholm-2018.svg", "Stockholm Sweden, October 2018"]
];

/**
 * Prepares the HTML element that should be placed on the 'preview' cell of the activities data.
 * This has to be performed prior to activities table population as it is not included on the
 * initial data. This function 'adds' the generated preview html to the data array.
 */
function prepareActivitiesPreviewData() {
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
        moreImg.setAttribute('src', 'img/tournaments/' + activitiesPreviewData[i][0]);
        moreImg.setAttribute('alt', activitiesPreviewData[i][0].replace('.svg', ''));
        const decrDiv = document.createElement('div');
        decrDiv.setAttribute('class', 'preview-desc');
        decrDiv.innerHTML = activitiesPreviewData[i][1];

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

    // Populate data
    prepareActivitiesPreviewData();
    popActivityData(activitiesTable);
}

function popActivityData(activitiesTable) {
    const activitiesBody = document.createElement('tbody');
    for (let i = 0; i < activitiesDataArray.length; i++) {
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
const evolutionDataArray = [
    ['2021 2nd Qtr.', '5'],
    ['2021 1st Qtr.', '6'],
    ['2020 4th Qtr.', '6'],
    ['2020 3nd Qtr.', '6'],
    ['2020 2nd Qtr.', '6'],
    ['2020 1st Qtr.', '6'],
    ['2019 4th Qtr.', '6'],
    ['2019 3nd Qtr.', '7'],
    ['2019 2nd Qtr.', '6'],
    ['2019 1st Qtr.', '10'],
    ['2018 4th Qtr.', '15'],
    ['2018 3nd Qtr.', '15'],
    ['2018 2nd Qtr.', '35'],
    ['2018 1st Qtr.', '70'],
    ['2017 4th Qtr.', '91'],
    ['2017 3nd Qtr.', '117'],
    ['2017 2nd Qtr.', '190'],
    ['2017 1st Qtr.', '204'],
    ['2016 4th Qtr.', '210'],
    ['2016 3nd Qtr.', '310'],
    ['2016 2nd Qtr.', '358'],
    ['2016 1st Qtr.', '522'],
    ['2015 4th Qtr.', '576'],
    ['2015 3nd Qtr.', '948'],
    ['2015 2nd Qtr.', '1042'],
    ['2015 1st Qtr.', '1117'],
    ['2014 4th Qtr.', '1280'],
    ['2014 3nd Qtr.', '1709'],
    ['2014 2nd Qtr.', '2150'],
    ['2014 1st Qtr.', '2124'],
    ['2013 4th Qtr.', '1985']

];

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

    // Populate data
    prepareEvolutionProgressData();
    popEvolutionData(evolutionTable);
}

function popEvolutionData(evolutionTable) {
    const evolutionBody = document.createElement('tbody');
    for (let i = 0; i < evolutionDataArray.length; i++) {
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
        if (e.code === 'Escape')
            clearCtxMenu();
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


// Main Execution

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
