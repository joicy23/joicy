document.getElementById('pagamento').addEventListener('click', function() {
    resetPaymentStatus(); // Reseta o status de pagamento para "Aguardando pagamento"
    const paymentId = localStorage.getItem('paymentId');
    const pixQrcode = localStorage.getItem('pixQrcode');
    const pixQrcodeText = localStorage.getItem('pixQrcodeText');

    if (paymentId && pixQrcode && pixQrcodeText) {
        openResultPopup({ id: paymentId, pix: { qrcode: pixQrcode, qrcode_text: pixQrcodeText } });
        checkPaymentStatus(paymentId);
    } else {
        const popup = document.getElementById('popup');
        popup.classList.remove('hidden');
        document.getElementById('popup-content').style.animation = 'popup-animation-in 0.3s ease-out';
    }
});

document.getElementById('close-btn').addEventListener('click', function() {
    closePopup('popup');
});

document.getElementById('close-result-btn').addEventListener('click', function() {
    closePopup('popup-result');
});

function closePopup(popupId) {
    const popupContent = document.getElementById(popupId + '-content');
    popupContent.style.animation = 'popup-animation-out 0.3s ease-out';
    popupContent.addEventListener('animationend', function() {
        document.getElementById(popupId).classList.add('hidden');
    }, { once: true });
}

document.getElementById('cpf').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = v;
});

document.getElementById('participation-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    resetPaymentStatus(); // Reseta o status de pagamento para "Aguardando pagamento"

    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = 'Aguarde...';

    try {
        const response = await fetch('https://api-10.vercel.app/criar_fatura', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, cpf })
        });

        if (!response.ok) {
            throw new Error('Erro ao criar a fatura.');
        }

        const data = await response.json();
        localStorage.setItem('paymentId', data.id);
        localStorage.setItem('pixQrcode', data.pix.qrcode);
        localStorage.setItem('pixQrcodeText', data.pix.qrcode_text);

        document.getElementById('popup').classList.add('hidden');
        openResultPopup(data);
        checkPaymentStatus(data.id);
    } catch (error) {
        showNotificationToast(error.message, 'error');
    } finally {
        submitBtn.textContent = 'PARTICIPAR';
    }
});

function resetPaymentStatus() {
    const paymentStatus = document.getElementById('payment-status');
    paymentStatus.textContent = 'Aguardando pagamento';
    paymentStatus.style.color = 'black';
}

function openResultPopup(data) {
    const popupResult = document.getElementById('popup-result');
    document.getElementById('qrcode-img').src = data.pix.qrcode;
    document.getElementById('pix-key').value = data.pix.qrcode_text;
    popupResult.classList.remove('hidden');
    document.getElementById('popup-result-content').style.animation = 'popup-animation-in 0.3s ease-out';
}

function checkPaymentStatus(paymentId) {
    const intervalId = setInterval(async function() {
        try {
            const response = await fetch(`https://apiverifica.vercel.app/obter_json/${paymentId}`);
            if (!response.ok) {
                throw new Error('Erro ao verificar o status do pagamento.');
            }
            const data = await response.json();
            if (data.status === 'paid' || data.status === 'externally_paid') {
                document.getElementById('payment-status').textContent = 'PAGAMENTO CONFIRMADO!';
                document.getElementById('payment-status').style.color = 'green';
                showNotificationToast('Pagamento confirmado!', 'success');

                // Adiciona participante confirmado
                addConfirmedParticipant();

                // Remove informações de pagamento do cache
                localStorage.removeItem('paymentId');
                localStorage.removeItem('pixQrcode');
                localStorage.removeItem('pixQrcodeText');

                clearInterval(intervalId);
            } else if (['canceled', 'refunded', 'expired', 'in_protest'].includes(data.status)) {
                localStorage.removeItem('paymentId');
                localStorage.removeItem('pixQrcode');
                localStorage.removeItem('pixQrcodeText');
                showNotificationToast('Pagamento não realizado. Por favor, tente novamente.', 'error');
                closePopup('popup-result');
                const popup = document.getElementById('popup');
                popup.classList.remove('hidden');
                document.getElementById('popup-content').style.animation = 'popup-animation-in 0.3s ease-out';
                clearInterval(intervalId);
            }
        } catch (error) {
            showNotificationToast('Erro ao verificar o status do pagamento.', 'error');
        }
    }, 10000);
}

function addConfirmedParticipant() {
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    const date = new Date().toLocaleDateString('pt-BR');
    const newParticipant = { value: 'R$10,00', name: nome, date, confirmed: true };

    participants.push(newParticipant);
    localStorage.setItem('participants', JSON.stringify(participants));

    updateParticipantsList();
    updateAccumulatedValue();
    showToast(`Participante confirmado: ${nome}`);
}

document.getElementById('copy-btn').addEventListener('click', function() {
    const pixKey = document.getElementById('pix-key');
    pixKey.select();
    pixKey.setSelectionRange(0, 99999); // Para dispositivos móveis
    document.execCommand('copy');
    showNotificationToast('Chave PIX copiada!', 'success');
});

function showNotificationToast(message, type = 'error') {
    const notificationToast = document.getElementById('notification-toast');
    notificationToast.textContent = message;
    notificationToast.className = `notification-toast show ${type}`;
    setTimeout(() => {
        notificationToast.className = notificationToast.className.replace('show', '');
    }, 3000);
}

let accumulatedValue = parseInt(localStorage.getItem('accumulatedValue')) || 0;
let participants = JSON.parse(localStorage.getItem('participants')) || [];
let timer = parseInt(localStorage.getItem('timer')) || 600;

const API_BASE_URL = "https://api.baserow.io/api/database/rows";
const WINNERS_TABLE_ID = "304492";
const API_TOKEN = "EVUzDnc6WEszbNEq1KmUVnCwq6RMNjDZ";
const HEADERS = {
    "Authorization": `Token ${API_TOKEN}`,
    "Content-Type": "application/json"
};

// Função para adicionar um participante
function addParticipant() {
    fetch('https://randomuser.me/api/?results=1&nat=BR')
        .then(response => response.json())
        .then(data => {
            const participant = data.results[0];
            const firstName = participant.name.first;
            const lastName = participant.name.last;
            const hiddenLastName = lastName[0] + '******';
            const date = new Date().toLocaleDateString('pt-BR');
            const newParticipant = { value: 'R$10,00', name: `${firstName} ${hiddenLastName}`, date };

            participants.push(newParticipant);
            localStorage.setItem('participants', JSON.stringify(participants));

            updateParticipantsList();
            updateAccumulatedValue();
            playNotificationSound();
            showToast(`Novo participante: ${firstName} ${hiddenLastName}`);
        });
}

// Função para atualizar a lista de participantes
function updateParticipantsList() {
    const participantsList = document.getElementById('participants-list');
    participantsList.innerHTML = '';

    if (participants.length === 0) {
        participantsList.innerHTML = '<tr><td colspan="3">Nenhum participante ainda.</td></tr>';
    } else {
        participants.forEach(participant => {
            const row = document.createElement('tr');
            row.innerHTML = `<td style="background-color: #76ff03;">${participant.value}</td><td>${participant.name}</td><td>${participant.date}</td>`;
            participantsList.appendChild(row);
        });
    }

    document.getElementById('participants-count').innerText = participants.length;
}

// Função para atualizar o valor acumulado
function updateAccumulatedValue() {
    // Apenas incrementar se houver participantes
    if (participants.length > 0) {
        accumulatedValue += 10;
        localStorage.setItem('accumulatedValue', accumulatedValue);
    }
    document.querySelectorAll('#accumulated-value').forEach(el => {
        el.innerText = `R$${accumulatedValue},00`;
    });
}

// Função para iniciar o timer
function startTimer() {
    const interval = setInterval(() => {
        timer--;
        localStorage.setItem('timer', timer);

        const minutes = Math.floor((timer % 3600) / 60);
        const seconds = timer % 60;
        const hours = Math.floor(timer / 3600);

        let timeText = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        let timeUnit = 'Minutos';

        if (timer >= 3600) {
            timeText = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
            timeUnit = 'Horas';
        } else if (timer < 60) {
            timeText = `${seconds}`;
            timeUnit = 'Segundos';
        }

        document.getElementById('timer').innerText = timeText;
        document.getElementById('time-unit').innerText = timeUnit;
        document.getElementById('draw-time').innerText = `${timeText} ${timeUnit.toUpperCase()}`;

        if (timer <= 0) {
            clearInterval(interval);
            drawWinner();
            resetTimer();
        }
    }, 1000);
}


// Função para sortear um ganhador
function drawWinner() {
    const winner = participants[Math.floor(Math.random() * participants.length)];
    if (winner) {
        const winnerData = {
            "VALOR": `R$${accumulatedValue},00`,
            "NOME": winner.name,
            "DATA": winner.date,
            "ST": "S"
        };

        // POST the winner to the winners table
        fetch(`${API_BASE_URL}/table/${WINNERS_TABLE_ID}/?user_field_names=true`, {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify(winnerData)
        })
        .then(() => {
            const winnersList = document.getElementById('winners-list');
            const row = document.createElement('tr');
            row.innerHTML = `<td style="background-color: #76ff03;">R$${accumulatedValue},00</td><td>${winner.name}</td><td>${winner.date}</td>`;
            winnersList.appendChild(row);

            // Remove todos os participantes e resetar o valor acumulado após o sorteio
            participants = [];
            localStorage.setItem('participants', JSON.stringify(participants));
            localStorage.setItem('accumulatedValue', 0);
            accumulatedValue = 0;

            updateParticipantsList();
            updateAccumulatedValue();
            playNotificationSound();
            showToast(`Ganhador: ${winner.name}`);
        });
    }
}

// Função para resetar o timer para 30 minutos
function resetTimer() {
    timer = 600; // 30 minutos em segundos
    localStorage.setItem('timer', timer);
    startTimer();
}

// Função para atualizar a contagem de usuários online
function updateOnlineCount() {
    const onlineCount = Math.floor(Math.random() * 131) + 100; // Gera um número entre 100 e 230
    document.getElementById('online-count').innerText = onlineCount;
}

// Função para tocar o som de notificação
function playNotificationSound() {
    document.getElementById('notification-sound').play();
}

// Função para mostrar a notificação
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = 'toast show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

// Função para carregar a lista de vencedores
function loadWinnersList() {
    const winnersList = document.getElementById('winners-list');
    winnersList.innerHTML = '<tr><td colspan="3">Carregando...</td></tr>';

    fetch(`${API_BASE_URL}/table/${WINNERS_TABLE_ID}/?user_field_names=true`, { headers: HEADERS })
        .then(response => response.json())
        .then(data => {
            winnersList.innerHTML = '';

            if (data.results.length === 0) {
                winnersList.innerHTML = '<tr><td colspan="3">Nenhum ganhador ainda.</td></tr>';
            } else {
                data.results.forEach(winner => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td style="background-color: #76ff03;">${winner.VALOR}</td><td>${winner.NOME}</td><td>${winner.DATA}</td>`;
                    winnersList.appendChild(row);
                });
            }
        });
}

// Inicializa o valor acumulado
document.querySelectorAll('#accumulated-value').forEach(el => {
    el.innerText = `R$${accumulatedValue},00`;
});

// Inicializa o timer e atualiza a lista de participantes e vencedores ao carregar a página
startTimer();
updateParticipantsList();
loadWinnersList();

// Atualiza a contagem de usuários online a cada 10 segundos
setInterval(updateOnlineCount, 10000);

// Simula a entrada de novos participantes em intervalos aleatórios
setInterval(addParticipant, Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000);

// Atualiza a lista de vencedores a cada 10 segundos
setInterval(loadWinnersList, 10000);