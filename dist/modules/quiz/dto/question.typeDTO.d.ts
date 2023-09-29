import { OptionDTO } from './option.typeDTO';
export declare class QuestionDTO {
    title: string;
    questionType: string;
    options: OptionDTO[];
    duration: number;
    points: number;
    mediaUrl: string;
}
