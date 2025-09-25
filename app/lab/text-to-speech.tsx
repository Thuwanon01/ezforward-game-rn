import QuestionBox from "@/components/lab/QuestionBox";
import React from "react";


const questionText = "What is the capital of France?";

export default function TextToSpeechPage() {
  return (
    <QuestionBox question={questionText} />
  );
}