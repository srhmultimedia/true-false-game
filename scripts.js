
document.addEventListener('DOMContentLoaded', function () {
    // Game data
    const statements = [
        {
            text: "El mes con el mayor ingreso asegura automáticamente el mejor resultado financiero.",
            answer: false,
            explanation: "Un mayor ingreso no garantiza mejores resultados si los gastos también aumentan proporcionalmente o más."
        },
        {
            text: "Un gasto mínimo no siempre significa que haya habido mayor ahorro.",
            answer: true,
            explanation: "El ahorro depende de la relación entre ingresos y gastos, no solo del nivel de gastos."
        },
        {
            text: "Si el porcentaje de desperdicio es el más bajo, el mes se considera sostenible, aunque los gastos sean altos.",
            answer: false,
            explanation: "La sostenibilidad requiere equilibrio entre varios factores, no solo un bajo desperdicio."
        },
        {
            text: "El promedio mensual siempre está a medio camino exacto entre el mínimo y el máximo.",
            answer: false,
            explanation: "El promedio depende de la distribución de todos los valores, no solo de los extremos."
        },
        {
            text: "Tener un máximo histórico en ingresos puede acompañarse de un máximo histórico en gastos.",
            answer: true,
            explanation: "Los ingresos y gastos pueden aumentar simultáneamente, especialmente en períodos de expansión."
        },
        {
            text: "El mes con el valor mínimo en ahorros indica falta de disciplina financiera.",
            answer: false,
            explanation: "Pueden existir factores circunstanciales que justifiquen un ahorro mínimo en ciertos períodos."
        },
        {
            text: "Reducir el desperdicio en un 2% puede ser más rentable que aumentar ingresos en un 1%.",
            answer: true,
            explanation: "La eficiencia operativa puede tener mayor impacto en la rentabilidad que pequeños aumentos en ingresos."
        },
        {
            text: "El valor máximo de cualquier rubro es más importante que su tendencia a la baja o al alza.",
            answer: false,
            explanation: "La tendencia suele ser más reveladora sobre la salud financiera que un valor máximo aislado."
        },
        {
            text: "Dos meses pueden compartir el mismo máximo, pero diferir en sostenibilidad.",
            answer: true,
            explanation: "La sostenibilidad depende de múltiples factores, no solo de alcanzar valores máximos."
        },
        {
            text: "Cuando todos los datos están muy cerca del promedio, los mínimos y máximos dejan de ser útiles.",
            answer: true,
            explanation: "Con poca variabilidad, los extremos aportan menos información significativa para el análisis."
        },
        {
            text: "El KPI verde (desperdicio) puede convertir un mes 'malo' en 'bueno' si baja lo suficiente.",
            answer: true,
            explanation: "La reducción significativa del desperdicio puede compensar otros indicadores negativos."
        },
        {
            text: "Un máximo en ingresos y un máximo en porcentaje de desperdicio juntos siempre son señal de ineficiencia.",
            answer: false,
            explanation: "La relación no es automática; depende del contexto y de la proporción entre ambos valores."
        },
        {
            text: "Un mínimo en gastos logra más impacto si coincide con un mínimo en ingresos.",
            answer: false,
            explanation: "Un mínimo en gastos tiene mayor impacto positivo cuando los ingresos son altos, no bajos."
        },
        {
            text: "El promedio no cuenta toda la historia; los extremos muestran riesgos y oportunidades.",
            answer: true,
            explanation: "Los valores extremos revelan vulnerabilidades y potenciales que el promedio puede ocultar."
        },
        {
            text: "Para evaluar decisiones, es vital comparar máximos y mínimos entre varios meses, no dentro de un único mes.",
            answer: true,
            explanation: "El análisis temporal comparativo ofrece una perspectiva más completa que el análisis de un solo período."
        }
    ];

    // Game state
    let currentQuestion = 0;
    let votes = Array(statements.length).fill().map(() => ({ true: 0, false: 0 }));
    let timerInterval;
    let countdownActive = false;
    let revealedAnswer = false;
    let showAnswers = false; // This is now permanently false since we removed the toggle button
    let sessionTimerInterval;
    let sessionTimeLeft = 10 * 60; // 10 minutes in seconds

    // DOM elements
    const statementCard = document.getElementById('statement-card');
    const statementText = document.getElementById('statement-text');
    const questionNumber = document.getElementById('question-number');
    const answerText = document.getElementById('answer-text');
    const explanationText = document.getElementById('explanation-text');
    const trueBtn = document.getElementById('true-btn');
    const falseBtn = document.getElementById('false-btn');
    const trueCount = document.getElementById('true-count');
    const falseCount = document.getElementById('false-count');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const resultsTable = document.getElementById('results-table');
    const exportBtn = document.getElementById('export-btn');
    const answerColumnHeader = document.getElementById('answer-column-header');
    const countdown = document.getElementById('countdown');
    const timerCircle = document.getElementById('timer-circle');
    const sessionCountdown = document.getElementById('session-countdown');
    const sessionTimerCircle = document.getElementById('session-timer-circle');
    const timesUpModal = document.getElementById('times-up-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Initialize game
    updateQuestion();
    updateResultsTable();
    startSessionTimer();

    // Event listeners
    trueBtn.addEventListener('click', () => vote(true));
    falseBtn.addEventListener('click', () => vote(false));
    prevBtn.addEventListener('click', previousQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    exportBtn.addEventListener('click', exportResults);
    closeModalBtn.addEventListener('click', () => {
        timesUpModal.classList.add('hidden');
    });

    // Functions
    function updateQuestion() {
        statementText.textContent = statements[currentQuestion].text;
        answerText.textContent = statements[currentQuestion].answer ? "VERDADERO" : "FALSO";
        explanationText.textContent = statements[currentQuestion].explanation;
        questionNumber.textContent = `Pregunta ${currentQuestion + 1} de ${statements.length}`;

        trueCount.textContent = votes[currentQuestion].true;
        falseCount.textContent = votes[currentQuestion].false;

        prevBtn.disabled = currentQuestion === 0;
        nextBtn.disabled = currentQuestion === statements.length - 1;

        // Reset card state
        if (statementCard.classList.contains('flipped')) {
            statementCard.classList.remove('flipped');
        }
        revealedAnswer = false;

        // Update results table
        updateResultsTable();
    }

    function vote(isTrue) {
        if (countdownActive || revealedAnswer) return;

        startCountdown();

        setTimeout(() => {
            votes[currentQuestion][isTrue ? 'true' : 'false']++;
            trueCount.textContent = votes[currentQuestion].true;
            falseCount.textContent = votes[currentQuestion].false;

            // Reveal answer
            statementCard.classList.add('flipped');
            revealedAnswer = true;

            // Create confetti effect
            createConfetti();

            // Update results table
            updateResultsTable();
        }, 3000);
    }

    function startCountdown() {
        if (countdownActive) return;

        countdownActive = true;
        let count = 3;
        countdown.textContent = count;

        // Reset timer circle
        timerCircle.style.strokeDashoffset = '0';

        // Animate timer circle
        timerCircle.style.strokeDashoffset = '283';

        timerInterval = setInterval(() => {
            count--;
            countdown.textContent = count;

            if (count <= 0) {
                clearInterval(timerInterval);
                countdown.textContent = "¡Ya!";
                setTimeout(() => {
                    countdown.textContent = "3";
                    countdownActive = false;
                    timerCircle.style.strokeDashoffset = '0';
                }, 1000);
            }
        }, 1000);
    }

    function startSessionTimer() {
        // Initialize the session timer display
        updateSessionTimerDisplay();

        // Start the countdown
        sessionTimerInterval = setInterval(() => {
            sessionTimeLeft--;
            updateSessionTimerDisplay();

            // Update the timer circle
            const totalTime = 10 * 60; // 10 minutes in seconds
            const progress = 1 - (sessionTimeLeft / totalTime);
            sessionTimerCircle.style.strokeDashoffset = 283 * progress;

            // Check if time is up
            if (sessionTimeLeft <= 0) {
                clearInterval(sessionTimerInterval);
                timesUpModal.classList.remove('hidden');
                sessionCountdown.classList.add('blink');
            }

            // Start blinking when less than 1 minute remains
            if (sessionTimeLeft <= 60 && !sessionCountdown.classList.contains('blink')) {
                sessionCountdown.classList.add('blink');
            }
        }, 1000);
    }

    function updateSessionTimerDisplay() {
        const minutes = Math.floor(sessionTimeLeft / 60);
        const seconds = sessionTimeLeft % 60;
        sessionCountdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function previousQuestion() {
        if (currentQuestion > 0) {
            currentQuestion--;
            updateQuestion();
        }
    }

    function nextQuestion() {
        if (currentQuestion < statements.length - 1) {
            currentQuestion++;
            updateQuestion();
        }
    }

    function updateResultsTable() {
        resultsTable.innerHTML = '';

        statements.forEach((statement, index) => {
            const row = document.createElement('tr');
            row.className = index === currentQuestion ? 'bg-blue-50' : '';

            const questionCell = document.createElement('td');
            questionCell.className = 'py-2 px-4 border-b border-gray-200 text-sm';
            questionCell.textContent = `${index + 1}. ${statement.text.substring(0, 50)}...`;

            const trueCell = document.createElement('td');
            trueCell.className = 'py-2 px-4 border-b border-gray-200 text-center text-sm';
            trueCell.textContent = votes[index].true;

            const falseCell = document.createElement('td');
            falseCell.className = 'py-2 px-4 border-b border-gray-200 text-center text-sm';
            falseCell.textContent = votes[index].false;

            const answerCell = document.createElement('td');
            answerCell.className = 'py-2 px-4 border-b border-gray-200 text-center text-sm font-medium hidden';
            answerCell.textContent = statement.answer ? 'V' : 'F';
            answerCell.className += statement.answer ? ' text-green-600' : ' text-red-600';

            row.appendChild(questionCell);
            row.appendChild(trueCell);
            row.appendChild(falseCell);
            row.appendChild(answerCell);

            resultsTable.appendChild(row);
        });
    }

    function exportResults() {
        const workbookData = [];

        statements.forEach((statement, index) => {
            workbookData.push([
                statement.text,
                votes[index].true,
                votes[index].false,
                statement.answer ? "Verdadero" : "Falso"
            ]);
        });

        const data = encodeURIComponent(JSON.stringify(workbookData));

        // URL real de tu Apps Script
        const appsScriptUrl = `https://script.google.com/macros/s/AKfycbwvpyrC3rVJzrXPOWRlVA8PN0Gx-DAhkj1sat1nHbOpB6B0ZfBeVXMNrImefMZIZvt1IA/exec?data=${data}`;

        // CORS proxy
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(appsScriptUrl)}`;

        fetch(proxyUrl)
            .then(res => res.text())
            .then(text => {
                console.info("✅" + text);
            })
            .catch(err => {
                console.error("❌ Error en fetch:", err);
            });
    }

    function createConfetti() {
        const container = document.body;
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(confetti);

            // Remove confetti after animation
            setTimeout(() => {
                container.removeChild(confetti);
            }, 5000);
        }
    }
});
