const apiUrl = "https://api.baserow.io/api/database/rows/table/304492/?user_field_names=true";
const apiToken = "EVUzDnc6WEszbNEq1KmUVnCwq6RMNjDZ";
const maxEntries = 20;

async function fetchData() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                "Authorization": `Token ${apiToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();

        // Check if the number of entries exceeds the max allowed
        while (data.results.length > maxEntries) {
            // Get the first entry (the oldest one)
            const oldestEntry = data.results.shift();
            // Delete the oldest entry
            await deleteEntry(oldestEntry.id);
        }
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
}

async function deleteEntry(rowId) {
    const deleteUrl = `https://api.baserow.io/api/database/rows/table/304492/${rowId}/`;
    try {
        const response = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
                "Authorization": `Token ${apiToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error deleting row ${rowId}: ${response.statusText}`);
        } else {
            console.log(`Row ${rowId} deleted successfully.`);
        }
    } catch (error) {
        console.error("Failed to delete entry:", error);
    }
}

// Fetch data every 10 seconds
setInterval(fetchData, 10000);

// Initial fetch
fetchData();

</script>
    <script>
        // Impedir uso do botão direito do mouse
        document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });

        // Impedir arrastar imagens
        document.addEventListener('dragstart', function (event) {
            event.preventDefault();
        });

        // Impedir o uso de teclas específicas
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey && (event.key === 'u' || event.key === 's' || event.key === 'c' || event.key === 'p' || event.key === 'x')) {
                event.preventDefault();
            }
            if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
                event.preventDefault();
            }
        });

        // Função para pausar o depurador
        function preventDebugger() {
            setInterval(function() {
                debugger;
            }, 100);
        }

        preventDebugger();

        // Ocultar elementos específicos ao inspecionar
        function hideOnInspect() {
            const elements = document.querySelectorAll('.protected');
            elements.forEach(el => {
                el.style.display = 'none';
            });
        }

        setInterval(hideOnInspect, 1000);

        // Adicionar proteção adicional
        window.addEventListener('load', function() {
            document.body.oncopy = function(event) {
                event.preventDefault();
            };
        });