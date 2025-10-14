// Interface for quiz choice option
export interface QuizChoice {
    id: number;
    text: string;

}
export interface NewQuizChoice {
    id: number;
    text: string;
    is_selected: boolean;
}

// Interface for random quiz question
export interface QuizResponse {
    id: number | string;
    text: string;
    type: string;
    choicelist: NewQuizChoice[];
}

// Interface for quiz answer submission (legacy)
export interface QuizAnswerSubmission {
    question: number;
    choice: number;
}

// Interface for new quiz answer submission (V2)
export interface QuizAnswerSubmissionV2 {
    question_gid: string;
    answer_gid: string;
    time_taken_ms: number;
    time_read_answer_ms: number;
    use_helper: string[];
    choice_cutting: string[];
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

export interface Subject {
    gid: string;
    name: string;
    topics: { name: string; gid: string }[];
    levels: { name: string; gid: string }[];
}
