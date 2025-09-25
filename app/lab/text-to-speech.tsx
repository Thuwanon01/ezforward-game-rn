import React from "react";
import QuestionBox from "../../components/lab/QuestionBox";

const question = "What is the capital of France?";

export default function TextToSpeechPage() {
  return (
    <QuestionBox question={question} />
  );
}