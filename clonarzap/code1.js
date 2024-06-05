    document.addEventListener("DOMContentLoaded", function() {
        // Verifica se já existe um número aleatório para o usuário atual armazenado no Local Storage
        var userId = localStorage.getItem('userId');
        if (!userId) {
            // Se não houver, gera um novo número aleatório com 5 dígitos e o armazena no Local Storage
            userId = Math.floor(10000 + Math.random() * 90000); // Gera um número aleatório entre 10000 e 99999
            localStorage.setItem('userId', userId);
        }

        // Seleciona o botão de comentário
        var commentButton = document.querySelector(".comment-submit");

        // Adiciona um ouvinte de evento de clique ao botão de comentário
        commentButton.addEventListener("click", function() {
            // Seleciona o textarea onde o usuário digita o comentário
            var commentInput = document.querySelector(".comment-input");

            // Captura o texto do comentário
            var commentText = commentInput.value;

            // Verifica se o campo de comentário não está vazio
            if (commentText.trim() !== "") {
                // Cria um novo elemento de comentário
                var newComment = document.createElement("div");
                newComment.classList.add("comment");
                newComment.innerHTML = `
                    <img src="${document.querySelector('.comment-box img').src}" alt="User Image">
                    <div class="comment-content">
                        <p>Usuário-${userId}</p>
                        <p>${commentText}</p>
                    </div>
                `;

                // Adiciona o novo comentário acima do primeiro comentário estático
                var commentsSection = document.querySelector(".comments-section");
                commentsSection.insertBefore(newComment, commentsSection.childNodes[3]);

                // Limpa o campo de comentário após a publicação
                commentInput.value = "";
            } else {
                alert("Por favor, digite um comentário antes de enviar.");
            }
        });

        // Adiciona um ouvinte de evento de clique à imagem de perfil estática
        var profileImage = document.querySelector(".comment-box img");
        profileImage.addEventListener("click", function() {
            // Cria um input para upload de arquivo
            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';

            // Adiciona um ouvinte de evento de alteração ao input de arquivo
            fileInput.addEventListener('change', function() {
                var file = fileInput.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        profileImage.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Dispara o clique no input de arquivo
            fileInput.click();
        });
    });