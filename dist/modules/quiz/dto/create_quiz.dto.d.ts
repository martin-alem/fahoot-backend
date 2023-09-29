import { QuestionDTO } from './question.typeDTO';
import { SettingDTO } from './settings.typeDTO';
export declare class CreateQuizDTO {
    title: string;
    status: string;
    questions: QuestionDTO[];
    settings: SettingDTO;
}
