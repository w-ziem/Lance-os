package com.wziem.lancebackend.api.mapper;

import com.wziem.lancebackend.api.dto.subtask.SubtaskDto;
import com.wziem.lancebackend.model.entity.Subtask;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubtaskMapper {

    SubtaskDto toDto(Subtask subtask);

    List<SubtaskDto> toDtoList(List<Subtask> subtasks);
}
