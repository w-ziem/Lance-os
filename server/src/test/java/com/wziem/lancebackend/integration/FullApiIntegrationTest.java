package com.wziem.lancebackend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wziem.lancebackend.dto.request.ClientCreateDto;
import com.wziem.lancebackend.dto.request.ProjectCreateDto;
import com.wziem.lancebackend.dto.request.TaskCreateDto;
import com.wziem.lancebackend.dto.response.ClientResponseDto;
import com.wziem.lancebackend.dto.response.ProjectResponseDto;
import com.wziem.lancebackend.dto.response.TaskResponseDto;
import com.wziem.lancebackend.model.enums.ProjectStatus;
import com.wziem.lancebackend.model.enums.TaskPriority;
import com.wziem.lancebackend.model.enums.TaskStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Full API Integration Tests
 * 
 * Tests the complete flow from HTTP request through to database.
 * Uses @SpringBootTest with actual database (H2 in-memory for tests).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FullApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // TODO: Add TestEntityManager or repositories for setup/verification
    // @Autowired
    // private TestEntityManager entityManager;

    // TODO: Implement integration test scenarios

    @Nested
    @DisplayName("Client -> Project -> Task workflow")
    class FullWorkflowTests {

        @Test
        @WithMockUser
        @DisplayName("Should create client, project, and task in sequence")
        void shouldCreateClientProjectTaskSequence() throws Exception {
            // TODO: Implement full workflow test
            //
            // Step 1: Create a client
            // ClientCreateDto clientDto = ClientCreateDto.builder()
            //         .name("Integration Test Client")
            //         .email("integration@test.com")
            //         .build();
            //
            // MvcResult clientResult = mockMvc.perform(post("/api/clients")
            //         .with(csrf())
            //         .contentType(MediaType.APPLICATION_JSON)
            //         .content(objectMapper.writeValueAsString(clientDto)))
            //     .andExpect(status().isCreated())
            //     .andReturn();
            //
            // ClientResponseDto createdClient = objectMapper.readValue(
            //     clientResult.getResponse().getContentAsString(), ClientResponseDto.class);
            //
            // // Step 2: Create a project for that client
            // ProjectCreateDto projectDto = ProjectCreateDto.builder()
            //         .name("Integration Test Project")
            //         .clientId(createdClient.getId())
            //         .status(ProjectStatus.PLANNED)
            //         .build();
            //
            // MvcResult projectResult = mockMvc.perform(post("/api/projects")
            //         .with(csrf())
            //         .contentType(MediaType.APPLICATION_JSON)
            //         .content(objectMapper.writeValueAsString(projectDto)))
            //     .andExpect(status().isCreated())
            //     .andReturn();
            //
            // ProjectResponseDto createdProject = objectMapper.readValue(
            //     projectResult.getResponse().getContentAsString(), ProjectResponseDto.class);
            //
            // // Step 3: Create a task for that project
            // TaskCreateDto taskDto = TaskCreateDto.builder()
            //         .title("Integration Test Task")
            //         .projectId(createdProject.getId())
            //         .priority(TaskPriority.HIGH)
            //         .estimatedHours(4)
            //         .build();
            //
            // mockMvc.perform(post("/api/tasks")
            //         .with(csrf())
            //         .contentType(MediaType.APPLICATION_JSON)
            //         .content(objectMapper.writeValueAsString(taskDto)))
            //     .andExpect(status().isCreated())
            //     .andExpect(jsonPath("$.title").value("Integration Test Task"))
            //     .andExpect(jsonPath("$.projectId").value(createdProject.getId()));
            //
            // // Step 4: Verify project now has 1 task
            // mockMvc.perform(get("/api/projects/" + createdProject.getId()))
            //     .andExpect(status().isOk())
            //     .andExpect(jsonPath("$.taskCount").value(1));
        }
    }

    @Nested
    @DisplayName("Cascade delete tests")
    class CascadeDeleteTests {

        @Test
        @WithMockUser
        @DisplayName("Deleting client should delete associated projects")
        void deletingClientShouldDeleteProjects() throws Exception {
            // TODO: Create client with project, delete client, verify project is gone
        }

        @Test
        @WithMockUser
        @DisplayName("Deleting project should delete associated tasks")
        void deletingProjectShouldDeleteTasks() throws Exception {
            // TODO: Create project with tasks, delete project, verify tasks are gone
        }
    }

    @Nested
    @DisplayName("Scheduling integration tests")
    class SchedulingIntegrationTests {

        @Test
        @WithMockUser
        @DisplayName("Should generate schedule for tasks")
        void shouldGenerateScheduleForTasks() throws Exception {
            // TODO: Create tasks, call generate-schedule, verify calendar events created
        }

        @Test
        @WithMockUser
        @DisplayName("Should not schedule locked tasks")
        void shouldNotScheduleLockedTasks() throws Exception {
            // TODO: Create locked and unlocked tasks, verify only unlocked are scheduled
        }
    }

    @Nested
    @DisplayName("Validation integration tests")
    class ValidationIntegrationTests {

        @Test
        @WithMockUser
        @DisplayName("Should reject client with invalid email format")
        void shouldRejectInvalidEmail() throws Exception {
            // TODO: Test email validation
        }

        @Test
        @WithMockUser
        @DisplayName("Should reject task with past deadline")
        void shouldRejectPastDeadline() throws Exception {
            // TODO: Test deadline validation (when implemented)
        }

        @Test
        @WithMockUser
        @DisplayName("Should reject project end date before start date")
        void shouldRejectInvalidDateRange() throws Exception {
            // TODO: Test date range validation (when implemented)
        }
    }

    @Nested
    @DisplayName("Edge case tests")
    class EdgeCaseTests {

        @Test
        @WithMockUser
        @DisplayName("Should handle concurrent updates")
        void shouldHandleConcurrentUpdates() throws Exception {
            // TODO: Test optimistic locking / concurrent modification
        }

        @Test
        @WithMockUser
        @DisplayName("Should handle very long text fields")
        void shouldHandleLongTextFields() throws Exception {
            // TODO: Test with maximum length strings
        }

        @Test
        @WithMockUser
        @DisplayName("Should handle special characters in names")
        void shouldHandleSpecialCharacters() throws Exception {
            // TODO: Test with unicode, emojis, special characters
        }
    }

    // TODO: Add test configuration for H2 in-memory database
    // Create src/test/resources/application-test.yml with:
    // spring:
    //   datasource:
    //     url: jdbc:h2:mem:testdb
    //     driver-class-name: org.h2.Driver
    //   jpa:
    //     hibernate:
    //       ddl-auto: create-drop
    //   flyway:
    //     enabled: false
}
