package com.wziem.lancebackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wziem.lancebackend.config.CustomUserDetailsService;
import com.wziem.lancebackend.config.JwtAuthenticationFilter;
import com.wziem.lancebackend.config.JwtTokenProvider;
import com.wziem.lancebackend.dto.request.ClientCreateDto;
import com.wziem.lancebackend.dto.request.ClientUpdateDto;
import com.wziem.lancebackend.dto.response.ClientResponseDto;
import com.wziem.lancebackend.exception.ResourceNotFoundException;
import com.wziem.lancebackend.service.ClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;

/**
 * Controller tests for ClientController
 * 
 * Uses @WebMvcTest for slice testing of the web layer only.
 */
@WebMvcTest(ClientController.class)
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ClientService clientService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private ClientResponseDto testClientResponse;
    private ClientCreateDto createDto;
    private ClientUpdateDto updateDto;

    @BeforeEach
    void setUp() {
        testClientResponse = ClientResponseDto.builder()
                .id(1L)
                .name("Test Client")
                .email("test@example.com")
                .phone("+1234567890")
                .company("Test Company")
                .notes("Test notes")
                .projectCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        createDto = ClientCreateDto.builder()
                .name("Test Client")
                .email("test@example.com")
                .phone("+1234567890")
                .company("Test Company")
                .notes("Test notes")
                .build();

        updateDto = ClientUpdateDto.builder()
                .name("Updated Client")
                .build();
    }

    // TODO: Implement the following test cases

    @Nested
    @DisplayName("POST /api/clients")
    class CreateClientTests {

        @Test
        @WithMockUser
        @DisplayName("Should create client and return 201")
        void shouldCreateClientAndReturn201() throws Exception {
            // TODO: Implement test
            // when(clientService.create(any(ClientCreateDto.class))).thenReturn(testClientResponse);
            //
            // mockMvc.perform(post("/api/clients")
            //         .with(csrf())
            //         .contentType(MediaType.APPLICATION_JSON)
            //         .content(objectMapper.writeValueAsString(createDto)))
            //     .andExpect(status().isCreated())
            //     .andExpect(jsonPath("$.id").value(1))
            //     .andExpect(jsonPath("$.name").value("Test Client"));
            //
            // verify(clientService).create(any(ClientCreateDto.class));
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 400 for invalid request")
        void shouldReturn400ForInvalidRequest() throws Exception {
            // TODO: Test with missing required fields
            // ClientCreateDto invalidDto = ClientCreateDto.builder().build(); // missing name
            //
            // mockMvc.perform(post("/api/clients")
            //         .with(csrf())
            //         .contentType(MediaType.APPLICATION_JSON)
            //         .content(objectMapper.writeValueAsString(invalidDto)))
            //     .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 401 without authentication")
        void shouldReturn401WithoutAuth() throws Exception {
            // TODO: Test unauthenticated request
        }
    }

    @Nested
    @DisplayName("GET /api/clients/{id}")
    class GetClientByIdTests {

        @Test
        @WithMockUser
        @DisplayName("Should return client when found")
        void shouldReturnClientWhenFound() throws Exception {
            // TODO: Implement test
            // when(clientService.getById(1L)).thenReturn(testClientResponse);
            //
            // mockMvc.perform(get("/api/clients/1"))
            //     .andExpect(status().isOk())
            //     .andExpect(jsonPath("$.id").value(1))
            //     .andExpect(jsonPath("$.name").value("Test Client"));
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 404 when not found")
        void shouldReturn404WhenNotFound() throws Exception {
            // TODO: Implement test
            // when(clientService.getById(anyLong())).thenThrow(new ResourceNotFoundException("Client", 999L));
            //
            // mockMvc.perform(get("/api/clients/999"))
            //     .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/clients")
    class GetAllClientsTests {

        @Test
        @WithMockUser
        @DisplayName("Should return all clients")
        void shouldReturnAllClients() throws Exception {
            // TODO: Implement test
        }

        @Test
        @WithMockUser
        @DisplayName("Should return empty array when no clients")
        void shouldReturnEmptyArrayWhenNoClients() throws Exception {
            // TODO: Implement test
        }
    }

    @Nested
    @DisplayName("GET /api/clients/search")
    class SearchClientsTests {

        @Test
        @WithMockUser
        @DisplayName("Should search clients by name")
        void shouldSearchClientsByName() throws Exception {
            // TODO: Implement test
            // when(clientService.searchByName("Test")).thenReturn(Collections.singletonList(testClientResponse));
            //
            // mockMvc.perform(get("/api/clients/search").param("name", "Test"))
            //     .andExpect(status().isOk())
            //     .andExpect(jsonPath("$").isArray())
            //     .andExpect(jsonPath("$[0].name").value("Test Client"));
        }
    }

    @Nested
    @DisplayName("PUT /api/clients/{id}")
    class UpdateClientTests {

        @Test
        @WithMockUser
        @DisplayName("Should update client successfully")
        void shouldUpdateClientSuccessfully() throws Exception {
            // TODO: Implement test
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 404 when client not found")
        void shouldReturn404WhenNotFound() throws Exception {
            // TODO: Implement test
        }
    }

    @Nested
    @DisplayName("DELETE /api/clients/{id}")
    class DeleteClientTests {

        @Test
        @WithMockUser
        @DisplayName("Should delete client and return 204")
        void shouldDeleteClientAndReturn204() throws Exception {
            // TODO: Implement test
            // doNothing().when(clientService).delete(1L);
            //
            // mockMvc.perform(delete("/api/clients/1").with(csrf()))
            //     .andExpect(status().isNoContent());
            //
            // verify(clientService).delete(1L);
        }

        @Test
        @WithMockUser
        @DisplayName("Should return 404 when client not found")
        void shouldReturn404WhenNotFound() throws Exception {
            // TODO: Implement test
        }
    }

    // TODO: Add tests for:
    // - Request validation (email format, phone format)
    // - Response content type
    // - Error response format
    // - Pagination parameters (when implemented)
}
