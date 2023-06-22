const translations = [];

addEventListener('DOMContentLoaded', init);

function init() {
    cancelTranslation();
    loadTranslation();
}

async function loadTranslation() {
    const response = await fetch('/translations.json');
    translations.splice(0, translations.length, ...(await response.json()));
    fillTranslation();
}

async function fillTranslation() {
    translations.sort((a, b) => {
        if (a.isDraft && !b.isDraft)
            return -1;

        if (!a.isDraft && b.isDraft)
            return 1;

        if (a.source < b.source)
            return -1;

        if (a.source > b.source)
            return 1;

        if (a.domain < b.domain)
            return -1;

        if (a.domain > b.domain)
            return 1;

        if (a.context < b.context)
            return -1;

        if (a.context > b.context)
            return 1;

        return 0;
    });

    let cell;
    const translationSection = document.getElementById('translationSection');
    translationSection.innerHTML = '';
    for (let index = 0; index < translations.length; index++) {
        const translation = translations[index];
        translation.index = index;
        translation.row = document.createElement('TR');
        translation.row.addEventListener('click', () => editRow(index));
        translation.row.title = translation.ref;

        cell = document.createElement('TD');
        cell.innerHTML = (index + 1);
        translation.row.appendChild(cell);

        cell = document.createElement('TD');
        cell.innerHTML = '';
        if (translation.isPlural)
            cell.innerHTML += '<span class="label is-plural">Plural</span>';
        if (translation.isJson)
            cell.innerHTML += '<span class="label is-json">JSON</span>';
        cell.innerHTML += translation.source ?? '';
        translation.row.appendChild(cell);

        cell = document.createElement('TD');
        cell.innerHTML += translation.context ?? '';
        translation.row.appendChild(cell);

        translation.translationCell = document.createElement('TD');
        translation.translationCell.innerHTML = '';
        if (translation.isDraft)
            translation.translationCell.innerHTML += '<span class="label is-draft">Draft</span>';
        if (!translation.translation)
            translation.translationCell.innerHTML += '<span class="label is-empty">Empty</span>';
        else
            translation.translationCell.innerHTML += translation.translation ?? '';
        translation.row.appendChild(translation.translationCell);

        translationSection.appendChild(translation.row);
    }
}

let editingTranslation;
function editRow(index) {
    if (editingTranslation)
        editingTranslation.row.classList.remove('editing');

    editingTranslation = translations[index];
    if (!editingTranslation) {
        cancelTranslation();
        return;
    }

    editingTranslation.row.classList.add('editing');
    document.getElementById('isJson').checked = editingTranslation.isJson;
    document.getElementById('isDraft').checked = editingTranslation.isDraft;
    document.getElementById('ref').value = editingTranslation.ref;
    document.getElementById('source').value = editingTranslation.source;
    const translationControl = document.getElementById('translation');
    translationControl.value = editingTranslation.translation;
    translationControl.focus();
}

function translationUpdated(evt) {
    if (evt.code === 'Enter' && evt.ctrlKey)
        return updateTranslationAndNext();

    if (evt.code === 'Space' && evt.shiftKey)
        return removeDraftAndNext();

    document.getElementById('isDraft').checked = false;
}

function cancelTranslation() {
    if (editingTranslation)
        editingTranslation.row.classList.remove('editing');

    editingTranslation = null;
    document.getElementById('isJson').checked = false;
    document.getElementById('isDraft').checked = false;
    document.getElementById('ref').value = '';
    document.getElementById('source').value = '';
    document.getElementById('translation').value = '';
}

function updateTranslation() {
    if (!editingTranslation)
        return;

    let isUpdated = false;
    const isDraft = document.getElementById('isDraft').checked;
    const translation = document.getElementById('translation').value;
    if (editingTranslation.isDraft != isDraft) {
        editingTranslation.isDraft = isDraft;
        isUpdated = true;
    }

    if (editingTranslation.translation != translation) {
        editingTranslation.translation = translation;
        isUpdated = true;
    }

    if (!isUpdated)
        return;

    editingTranslation.isUpdated = true;

    editingTranslation.row.classList.add('is-updated');

    let translationCellInnerHtml = '';
    if (editingTranslation.isUpdated)
        translationCellInnerHtml += '<span class="label is-updated">Updated</span>';
    if (editingTranslation.isDraft)
        translationCellInnerHtml += '<span class="label is-draft">Draft</span>';

    if (!editingTranslation.translation)
        translationCellInnerHtml += '<span class="label is-empty">Empty</span>';
    else
        translationCellInnerHtml += editingTranslation.translation;

    editingTranslation.translationCell.innerHTML = translationCellInnerHtml;

    fillTranslation();
}

function updateTranslationAndNext() {
    const index = editingTranslation.index;
    updateTranslation();

    if (editingTranslation.index != index)
        editRow(index);
    else
        editRow(index + 1);
}

function removeDraftAndNext() {
    document.getElementById('isDraft').checked = false;
    updateTranslationAndNext();
}

async function saveTranslations() {
    const data = [];
    for (const translation of translations) {
        if (!translation.isUpdated)
            continue;

        data.push({
            source: translation.source,
            isPlural: translation.isPlural,
            language: translation.language,
            domain: translation.domain,
            context: translation.context,
            isJson: translation.isJson,
            isDraft: translation.isDraft,
            translation: translation.translation,
        });
    }

    if (!data.length) {
        alert('Nothing to update.');
        return;
    }

    const res = await fetch(
        '/update-translations',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

    if (res.ok) {
        alert('Translations updated.');
        location.reload();
        return;
    }

    console.error(res);
}

async function finish() {
    if (!confirm('Do you want to terminate this session'))
        return;

    const res = await fetch('/finish', {method: 'POST'});

    if (res.ok) {
        alert('Editor finished');
        window.close();
        return;
    }

    alert('There was an error when trying to finish the editor. You have to finish manually.');
}