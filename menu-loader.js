(async function () {
    const header = document.getElementById('site-header');
    if (!header) return;

    try {
        const response = await fetch('menu.html');
        if (!response.ok) throw new Error('Menu load failed');
        const html = await response.text();
        header.innerHTML = html;
    } catch (error) {
        console.error('Error loading menu:', error);
    }
})();
