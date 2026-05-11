package com.wziem.lancebackend.api.mapper;

import com.wziem.lancebackend.api.dto.client.ClientDto;
import com.wziem.lancebackend.model.entity.Client;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClientMapper {

    ClientDto toDto(Client client);
}
