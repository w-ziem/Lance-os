package com.wziem.lancebackend.api.mapper;

import com.wziem.lancebackend.api.dto.scope.ScopeItemDto;
import com.wziem.lancebackend.model.entity.ScopeItem;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ScopeItemMapper {

    ScopeItemDto toDto(ScopeItem scopeItem);

    List<ScopeItemDto> toDtoList(List<ScopeItem> scopeItems);
}
