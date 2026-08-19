package com.wziem.lancebackend.api.dto.ai;

import com.wziem.lancebackend.api.dto.client.ClientDto;
import com.wziem.lancebackend.api.dto.project.ProjectDto;
import com.wziem.lancebackend.api.dto.task.TaskDto;

import java.util.List;

public record VoiceIntakeResultDto(
        ClientDto client,
        ProjectDto project,
        List<TaskDto> tasks,
        String transcript
) {}
