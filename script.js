let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let answeredQuestions = [];

// Initialize the app
async function init() {
    try {
        // Fetch questions from JSON file
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error('Failed to load questions');
        }
        allQuestions = await response.json();
        displayWeekSelection();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.querySelector('.container').innerHTML = `
            <div class="card" style="text-align: center; padding: 60px 40px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>
                <h2 style="color: #ef4444; margin-bottom: 15px;">Failed to Load Questions</h2>
            </div>
        `;
    }
}

// Shuffle array function for random quiz
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function displayWeekSelection() {
    const weeks = [...new Set(allQuestions.map(q => q.week))].sort((a, b) => a - b);
    const weekGrid = document.getElementById('weekGrid');

    document.getElementById('totalQuestions').textContent = `Practice all ${allQuestions.length} questions in order`;

    weekGrid.innerHTML = '';
    weeks.forEach(week => {
        const weekQuestions = allQuestions.filter(q => q.week === week);
        const btn = document.createElement('button');
        btn.className = 'week-btn';
        btn.onclick = () => startQuiz(week);
        btn.innerHTML = `
            <div class="week-number">Week ${week}</div>
            <div class="question-count">${weekQuestions.length} questions</div>
        `;
        weekGrid.appendChild(btn);
    });

    document.getElementById('weekSelection').classList.remove('hidden');
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.add('hidden');
}

function startQuiz(week) {
    if (week === 'all') {
        // Full quiz - questions in original order
        currentQuestions = [...allQuestions];
    } else if (week === 'random') {
        // Random quiz - shuffle all questions
        currentQuestions = shuffleArray(allQuestions);
    } else {
        // Specific week quiz
        currentQuestions = allQuestions.filter(q => q.week === week);
    }

    currentQuestionIndex = 0;
    score = 0;
    answeredQuestions = [];
    selectedAnswer = null;

    document.getElementById('weekSelection').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    document.getElementById('resultsScreen').classList.add('hidden');

    document.getElementById('total').textContent = currentQuestions.length;
    document.getElementById('score').textContent = '0';

    displayQuestion();
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];

    document.getElementById('weekInfo').textContent = `Week ${question.week}`;
    document.getElementById('questionNumber').textContent =
        `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
    document.getElementById('questionText').textContent = question.question;

    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.onclick = () => selectAnswer(index);
        optionDiv.innerHTML = `
            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
            <div>${option}</div>
        `;
        optionsContainer.appendChild(optionDiv);
    });

    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    selectedAnswer = null;
}

function selectAnswer(index) {
    if (selectedAnswer !== null) return;

    selectedAnswer = index;
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = index === question.correctAnswer;

    if (isCorrect) {
        score++;
        document.getElementById('score').textContent = score;
    }

    const options = document.querySelectorAll('.option');
    options.forEach((opt, i) => {
        opt.classList.add('disabled');
        if (i === question.correctAnswer) {
            opt.classList.add('correct');
        }
        if (i === selectedAnswer && i !== question.correctAnswer) {
            opt.classList.add('incorrect');
        }
    });

    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');
    feedback.className = 'feedback ' + (isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
        feedback.innerHTML = '<strong>✓ Correct!</strong>';
    } else {
        feedback.innerHTML = `
            <strong>✗ Incorrect</strong>
            <div>The correct answer is: ${question.options[question.correctAnswer]}</div>
        `;
    }

    answeredQuestions.push({
        question: question.question,
        selectedAnswer: index,
        correctAnswer: question.correctAnswer,
        options: question.options,
        isCorrect
    });

    document.getElementById('nextBtn').classList.remove('hidden');
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');

    const percentage = Math.round((score / currentQuestions.length) * 100);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalTotal').textContent = currentQuestions.length;
    document.getElementById('percentage').textContent = `Score: ${percentage}%`;

    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = '';

    answeredQuestions.forEach((item, index) => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review-item';

        let answerHTML = '';
        if (!item.isCorrect) {
            answerHTML = `
                <div class="review-answer wrong">Your answer: ${item.options[item.selectedAnswer]}</div>
                <div class="review-answer correct">Correct answer: ${item.options[item.correctAnswer]}</div>
            `;
        }

        reviewDiv.innerHTML = `
            <div class="review-header">
                <div class="review-icon">${item.isCorrect ? '✅' : '❌'}</div>
                <div style="flex: 1;">
                    <div class="review-question">Q${index + 1}: ${item.question}</div>
                    ${answerHTML}
                </div>
            </div>
        `;
        reviewContainer.appendChild(reviewDiv);
    });
}

function backToWeekSelection() {
    displayWeekSelection();
}

// Initialize on page load
init();