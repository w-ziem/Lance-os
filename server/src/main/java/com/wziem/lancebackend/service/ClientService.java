package com.wziem.lancebackend.service;

import com.wziem.lancebackend.api.dto.client.ClientDetailDto;
import com.wziem.lancebackend.api.dto.client.ClientDto;
import com.wziem.lancebackend.api.dto.client.CreateClientRequest;
import com.wziem.lancebackend.api.dto.client.UpdateClientRequest;
import com.wziem.lancebackend.api.mapper.ClientMapper;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.model.entity.Client;
import com.wziem.lancebackend.model.enums.ProjectStatus;
import com.wziem.lancebackend.model.repository.ClientRepository;
import com.wziem.lancebackend.model.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ClientMapper clientMapper;

    public List<ClientDto> getAllClients() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return clientRepository.findAllByUserId(userId).stream()
                .map(clientMapper::toDto)
                .toList();
    }

    public ClientDetailDto getClient(UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Client client = clientRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
        long active    = projectRepository.countByUserIdAndClientIdAndStatus(userId, id, ProjectStatus.ACTIVE);
        long completed = projectRepository.countByUserIdAndClientIdAndStatus(userId, id, ProjectStatus.COMPLETED);
        BigDecimal revenue = projectRepository.sumCompletedBudgetByClient(userId, id);
        BigDecimal projectedRevenue = projectRepository.sumProjectedBudgetByClient(userId, id);
        return new ClientDetailDto(
                client.getId(), client.getName(), client.getEmail(),
                client.getCompanyName(), client.getPhone(), client.getNotes(),
                client.getCreatedAt(), active, completed, revenue, projectedRevenue
        );
    }

    @Transactional
    public ClientDto createClient(CreateClientRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Client client = Client.builder()
                .userId(userId)
                .name(request.name())
                .email(request.email())
                .companyName(request.companyName())
                .phone(request.phone())
                .notes(request.notes())
                .build();
        return clientMapper.toDto(clientRepository.save(client));
    }

    @Transactional
    public ClientDto updateClient(UUID id, UpdateClientRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Client client = clientRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));

        client.setName(request.name());
        client.setEmail(request.email());
        client.setCompanyName(request.companyName());
        client.setPhone(request.phone());
        client.setNotes(request.notes());

        return clientMapper.toDto(clientRepository.save(client));
    }

    @Transactional
    public void deleteClient(UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (!clientRepository.existsByIdAndUserId(id, userId)) {
            throw new EntityNotFoundException("Client not found");
        }
        clientRepository.deleteById(id);
    }
}
