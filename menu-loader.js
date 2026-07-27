(async function () {
    async function loadPartial(url, elementId) {
        const target = document.getElementById(elementId);
        if (!target) return;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(url + ' load failed');
            target.innerHTML = await response.text();
        } catch (error) {
            console.error('Error loading ' + url + ':', error);
        }
    }

    await Promise.all([
        loadPartial('menu.html', 'site-header'),
        loadPartial('footer.html', 'site-footer'),
    ]);
})();
