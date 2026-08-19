import type { ClientDto } from './client';
import type { ProjectDto } from './project';
import type { TaskDto } from './task';

export interface VoiceIntakeResultDto {
    client: ClientDto;
    project: ProjectDto;
    tasks: TaskDto[];
    transcript: string;
}
