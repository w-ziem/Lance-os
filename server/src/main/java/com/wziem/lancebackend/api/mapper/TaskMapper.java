package com.wziem.lancebackend.api.mapper;

import com.wziem.lancebackend.api.dto.task.TaskDto;
import com.wziem.lancebackend.model.entity.Subtask;
import com.wziem.lancebackend.model.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = SubtaskMapper.class)
public interface TaskMapper {

    @Mapping(target = "subtasks", source = "subtasks")
    TaskDto toDto(Task task, List<Subtask> subtasks);
}
