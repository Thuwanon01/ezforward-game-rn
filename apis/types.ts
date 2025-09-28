// Interface for quiz choice option
export interface QuizChoice {
    id: number;
    text: string;
}

// Interface for random quiz question
export interface RandomQuizResponse {
    id: number;
    text: string;
    type: string;
    choicelist: QuizChoice[];
}

// Interface for quiz answer submission
export interface QuizAnswerSubmission {
    question: number;
    choice: number;
}

// Interface for quiz choice with answer details (used in fetchSubmitAnswer response)
export interface QuizChoiceWithAnswer {
    id: number;
    text: string;
    is_correct: boolean;
    explanation: string;
}

// Interface for quiz answer response from fetchSubmitAnswer
export interface QuizAnswerResponse {
    id: number;
    text: string;
    type: string;
    word: string;
    explanation: string;
    choices: QuizChoiceWithAnswer[];
}