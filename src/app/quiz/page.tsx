'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const questions = [
  {
    id: 'objetivo',
    question: 'Qual é seu objetivo principal?',
    options: ['Autoridade', 'Atrair Parceiros', 'Rejuvenescimento'],
    type: 'single'
  },
  {
    id: 'mandibula',
    question: 'Como você descreveria a definição da sua mandíbula?',
    options: ['Definida', 'Escondida'],
    type: 'single'
  },
  {
    id: 'pele',
    question: 'Qual é o tipo da sua pele?',
    options: ['Oleosa', 'Seca', 'Mista', 'Não sei'],
    type: 'single'
  },
  {
    id: 'tempo',
    question: 'Quanto tempo você dedica diariamente à sua aparência?',
    options: ['5min', '15min', '+30min'],
    type: 'single'
  },
  {
    id: 'oculos',
    question: 'Você usa óculos?',
    options: ['Sim', 'Não'],
    type: 'single'
  },
  {
    id: 'rosto',
    question: 'Qual formato de rosto você imagina ter?',
    options: ['Quadrado', 'Redondo', 'Oval', 'Diamante', 'Não sei'],
    type: 'single'
  },
  {
    id: 'satisfacao',
    question: 'Em uma escala de 0 a 10, qual é sua satisfação atual com sua aparência?',
    options: Array.from({length: 11}, (_, i) => i.toString()),
    type: 'single'
  }
];

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      const question = questions[currentQuestion];
      const newAnswers = {
        ...answers,
        [question.id]: selectedAnswer
      };
      setAnswers(newAnswers);
      
      // Salvar no localStorage para usar na análise
      localStorage.setItem('quizAnswers', JSON.stringify(newAnswers));

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      }
    }
  };

  const handleFinishQuiz = () => {
    // Garantir que as respostas estão salvas
    localStorage.setItem('quizAnswers', JSON.stringify(answers));
    router.push('/upload');
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevQuestion = questions[currentQuestion - 1];
      setSelectedAnswer(answers[prevQuestion.id] || null);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Botão Voltar */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Dashboard
        </Link>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-[#E0E0E0] mb-2 font-medium">
            <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #9D50BB 0%, #B565FF 100%)',
                boxShadow: '0 0 20px rgba(157, 80, 187, 0.9), 0 0 40px rgba(157, 80, 187, 0.6)'
              }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="glass-card">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#FFFFFF]">
            {questions[currentQuestion].question}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {questions[currentQuestion].options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`quiz-option transition-all duration-300 ${
                  selectedAnswer === option 
                    ? 'quiz-option-selected' 
                    : ''
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Next Button */}
          {selectedAnswer && (
            <div className="mt-8 text-center animate-fade-in">
              {isLastQuestion ? (
                <button 
                  onClick={handleFinishQuiz}
                  className="btn-primary inline-block"
                >
                  Continuar para Upload
                </button>
              ) : (
                <button onClick={handleNext} className="btn-primary">
                  Próximo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Back Button */}
        {currentQuestion > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={handlePrevious}
              className="text-[#E0E0E0] hover:text-white transition-colors text-sm underline font-medium"
            >
              ← Anterior
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
