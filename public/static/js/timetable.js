document.getElementById('idContentEditable').addEventListener('keypress', (evt) => {
    if (evt.which === 13) {
        evt.preventDefault();
    }
});