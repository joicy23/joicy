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