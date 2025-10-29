import { BaseRepository } from "./BaseRepository";
import {
  QuizAnswerResponse,
  QuizAnswerSubmissionV2,
  QuizResponse,
  Subject,
} from "./types";

export class GameV2Repository extends BaseRepository {
  async fetchSubmitAnswer(
    question_gid: string,
    answer_gid: string,
    time_taken_ms: number,
    time_read_answer_ms: number,
    use_helper: string[] = [],
    choice_cutting: string[] = []
  ): Promise<QuizAnswerResponse> {
    const requestBody: QuizAnswerSubmissionV2 = {
      question_gid,
      answer_gid,
      time_taken_ms,
      time_read_answer_ms,
      use_helper,
      choice_cutting,
    };

    const data = await this.sfetch("/api/answers/", {
      method: "post",
      body: requestBody,
    });

    return data;
  }

  async fetchSuggestedQuestion(
    selectedSubject: string,
    myLevelStr: string,
    selectedTopicStr: string
  ): Promise<QuizResponse> {
    const data: any = await this.sfetch(
      `/api/learning-plans/suggested-question/?subject=
      ${selectedSubject}&levels=${myLevelStr}&topics=${selectedTopicStr}`
    );
    // return data.question;
    return data
  }

  async fetchAnswerSummary({ answered_date__gte, answered_date__lte }: { answered_date__gte?: string; answered_date__lte?: string }): Promise<any> {
    const data = await this.sfetch(
      '/api/answers/history/summary',
      {
        method: 'GET',
        params: {
          answered_date__gte: answered_date__gte,
          answered_date__lte: answered_date__lte
        }
      }
    )
    return data;
  }

  async fetchSubjects(): Promise<Subject[]> {
    return [
      {
        gid: "RAM1111",
        name: "English",
        topics: [
          {
            gid: "b61cd68e-0330-4d4d-b31e-e7c9598063fe",
            name: "Future Simple Tense",
          },
          {
            gid: "30fad672-cf6c-47d3-8bbc-8c94d4726b7f",
            name: "Past Simple Tense",
          },
          {
            gid: "23abb50d-a55c-43f4-a65d-5445cbe3f7b6",
            name: "Present Simple Tense",
          },
          {
            gid: "c99e4ffd-f90b-4aca-9ce9-1f130835f1f1",
            name: "Present Perfect Tense",
          },
        ],
        levels: [
          { name: "A1", gid: "a1" },
          { name: "A2", gid: "a2" },
          { name: "B1", gid: "b1" },
          { name: "B2", gid: "b2" },
          { name: "C1", gid: "c1" },
          { name: "C2", gid: "c2" },
        ],
      },
      {
        gid: "math",
        name: "Mathematics",
        topics: [
          { name: "Set", gid: "math101" },
          { name: "Trigone", gid: "math102" },
          { name: "Exponential", gid: "math103" },
        ],
        levels: [
          { name: "A1", gid: "a1" },
          { name: "A2", gid: "a2" },
          { name: "B1", gid: "b1" },
          { name: "B2", gid: "b2" },
          { name: "C1", gid: "c1" },
          { name: "C2", gid: "c2" },
        ],
      },
    ];
  }
}
