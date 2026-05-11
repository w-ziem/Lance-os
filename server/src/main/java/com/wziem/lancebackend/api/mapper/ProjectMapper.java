package com.wziem.lancebackend.api.mapper;

import com.wziem.lancebackend.api.dto.project.ProjectDto;
import com.wziem.lancebackend.model.entity.Project;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    ProjectDto toDto(Project project);
}
