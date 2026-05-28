package com.wziem.lancebackend.api.mapper;

import com.wziem.lancebackend.api.dto.task.TaskDto;
import com.wziem.lancebackend.model.entity.Task;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    TaskDto toDto(Task task);
}
