import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes countdown

    // Fetch quiz data from API
    useEffect(() => {
        fetch('http://localhost:5000/quiz-data')
            .then((response) => response.json())
            .then((data) => {
                setQuizData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching quiz data:', error);
                setLoading(false);
            });
    }, []);

    // Timer logic - starts when the quiz begins
    useEffect(() => {
        if (timeLeft === 0) {
            // Define handleSubmit inside this effect
            let totalScore = 0;
            quizData?.questions.forEach((question) => {
                const selectedAnswer = selectedAnswers[question.id];
                const correctAnswer = question.options.find(option => option.is_correct);
                if (selectedAnswer === correctAnswer.id) {
                    totalScore += 1;  // Add points for correct answer
                }
            });
            setScore(totalScore);
            setQuizFinished(true);
            return;
        }
        
        const timerInterval = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerInterval); // Cleanup interval on unmount
    }, [timeLeft, quizData, selectedAnswers]); // Add quizData and selectedAnswers as dependencies

    // Handle the answer selection
    const handleAnswerSelection = (questionId, optionId) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: optionId,
        }));
    };

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    if (!quizData || !quizData.questions) {
        return <div className="container">No quiz data available</div>;
    }

    return (
        <div className="container">
            <h1>Quiz</h1>
            <div className="timer">Time Left: {timeLeft} seconds</div>

            {quizFinished ? (
                <div className="score">
                    <h2>Your Score: {score} / {quizData.questions.length}</h2>
                    <button className="try-again-btn" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            ) : (
                <div>
                    {quizData.questions.map((question) => (
                        <div className="quiz-card" key={question.id}>
                            <p className="question-text">{question.description}</p>
                            <div className="options">
                                {question.options.map((option) => (
                                    <label className="option" key={option.id}>
                                        <input
                                            type="radio"
                                            name={question.id}
                                            value={option.id}
                                            checked={selectedAnswers[question.id] === option.id}
                                            onChange={() => handleAnswerSelection(question.id, option.id)}
                                        />
                                        {option.description}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button className="submit-btn" onClick={() => {
                        // Manual quiz submit logic
                        let totalScore = 0;
                        quizData.questions.forEach((question) => {
                            const selectedAnswer = selectedAnswers[question.id];
                            const correctAnswer = question.options.find(option => option.is_correct);
                            if (selectedAnswer === correctAnswer.id) {
                                totalScore += 1;  // Add points for correct answer
                            }
                        });
                        setScore(totalScore);
                        setQuizFinished(true);
                    }}>
                        Submit Quiz
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
