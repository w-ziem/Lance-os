package com.wziem.lancebackend.service;

import com.wziem.lancebackend.api.dto.client.ClientDto;
import com.wziem.lancebackend.api.dto.client.CreateClientRequest;
import com.wziem.lancebackend.api.dto.client.UpdateClientRequest;
import com.wziem.lancebackend.model.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public List<ClientDto> getAllClients() {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public ClientDto getClient(UUID id) {

        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Transactional
    public ClientDto createClient(CreateClientRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Transactional
    public ClientDto updateClient(UUID id, UpdateClientRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Transactional
    public void deleteClient(UUID id) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
