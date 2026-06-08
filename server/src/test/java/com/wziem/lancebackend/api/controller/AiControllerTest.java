package com.wziem.lancebackend.api.controller;

import com.wziem.lancebackend.api.dto.ai.ExtractedClientData;
import com.wziem.lancebackend.api.dto.client.ClientDto;
import com.wziem.lancebackend.api.dto.project.ProjectDto;
import com.wziem.lancebackend.api.dto.task.TaskDto;
import com.wziem.lancebackend.config.jwt.JwtAuthFilter;
import com.wziem.lancebackend.config.oauth.CustomOAuth2UserService;
import com.wziem.lancebackend.config.oauth.OAuth2AuthenticationSuccessHandler;
import com.wziem.lancebackend.model.enums.ProjectStatus;
import com.wziem.lancebackend.model.enums.TaskPriority;
import com.wziem.lancebackend.model.enums.TaskStatus;
import com.wziem.lancebackend.service.AiService;
import com.wziem.lancebackend.service.ClientService;
import com.wziem.lancebackend.service.ProjectService;
import com.wziem.lancebackend.service.TaskService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AiController.class)
@Import(AiControllerTest.OpenSecurity.class)
@TestPropertySource(properties = {"client.url=http://localhost:3000"})
class AiControllerTest {

    @TestConfiguration
    static class OpenSecurity {
        @Bean
        @Order(1)
        SecurityFilterChain testChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(a -> a.anyRequest().permitAll())
                    .build();
        }
    }

    @Autowired MockMvc mvc;
    @MockitoBean AiService aiService;
    @MockitoBean ClientService clientService;
    @MockitoBean ProjectService projectService;
    @MockitoBean TaskService taskService;
    @MockitoBean JwtAuthFilter jwtAuthFilter;
    @MockitoBean CustomOAuth2UserService customOAuth2UserService;
    @MockitoBean OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @BeforeEach
    void setupJwtFilterPassthrough() throws Exception {
        Mockito.doAnswer(invocation -> {
            HttpServletRequest req = invocation.getArgument(0);
            HttpServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthFilter).doFilter(Mockito.any(), Mockito.any(), Mockito.any());
    }

    private static final UUID CLIENT_ID = UUID.randomUUID();
    private static final UUID PROJECT_ID = UUID.randomUUID();

    @Test
    void voiceIntake_noTasksMentioned_createsDefaultPlanningTask() throws Exception {
        var audio = new MockMultipartFile("audio", "rec.webm", "audio/webm", new byte[]{1, 2, 3});
        String transcript = "New client, John Smith, works at Acme Corp.";

        var extracted = new ExtractedClientData(
                new ExtractedClientData.ExtractedClient("John Smith", null, "Acme Corp", null, null),
                new ExtractedClientData.ExtractedProject("Acme Project", null, null, null),
                List.of()
        );

        var client = new ClientDto(CLIENT_ID, "John Smith", "voice-intake-abc@placeholder.local",
                "Acme Corp", null, "Email not captured via voice — please update.", Instant.now());
        var project = new ProjectDto(PROJECT_ID, CLIENT_ID, "Acme Project", null,
                ProjectStatus.ACTIVE, null, Instant.now(), Instant.now(), null);
        var planTask = task(PROJECT_ID, "Plan and scope the project", TaskPriority.HIGH);

        when(aiService.transcribeAudio(any())).thenReturn(transcript);
        when(aiService.extractClientData(transcript)).thenReturn(extracted);
        when(clientService.createClient(any())).thenReturn(client);
        when(projectService.createProject(any())).thenReturn(project);
        when(taskService.createTask(any())).thenReturn(planTask);

        mvc.perform(multipart("/ai/voice-intake").file(audio))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.client.name").value("John Smith"))
                .andExpect(jsonPath("$.project.name").value("Acme Project"))
                .andExpect(jsonPath("$.tasks", hasSize(1)))
                .andExpect(jsonPath("$.tasks[0].title").value("Plan and scope the project"))
                .andExpect(jsonPath("$.transcript").value(transcript));
    }

    @Test
    void voiceIntake_withTasks_createsThemDirectly() throws Exception {
        var audio = new MockMultipartFile("audio", "rec.webm", "audio/webm", new byte[]{1, 2, 3});
        String transcript = "New client Jane Doe, build a landing page and a contact form.";

        var extracted = new ExtractedClientData(
                new ExtractedClientData.ExtractedClient("Jane Doe", "jane@doe.com", null, null, null),
                new ExtractedClientData.ExtractedProject("Jane's Website", null, null, null),
                List.of(
                        new ExtractedClientData.ExtractedTask("Build landing page", null, "HIGH"),
                        new ExtractedClientData.ExtractedTask("Build contact form", null, "MEDIUM")
                )
        );

        var client = new ClientDto(CLIENT_ID, "Jane Doe", "jane@doe.com", null, null, null, Instant.now());
        var project = new ProjectDto(PROJECT_ID, CLIENT_ID, "Jane's Website", null,
                ProjectStatus.ACTIVE, null, Instant.now(), Instant.now(), null);
        var t1 = task(PROJECT_ID, "Build landing page", TaskPriority.HIGH);
        var t2 = task(PROJECT_ID, "Build contact form", TaskPriority.MEDIUM);

        when(aiService.transcribeAudio(any())).thenReturn(transcript);
        when(aiService.extractClientData(transcript)).thenReturn(extracted);
        when(clientService.createClient(any())).thenReturn(client);
        when(projectService.createProject(any())).thenReturn(project);
        when(taskService.createTask(any())).thenReturn(t1, t2);

        mvc.perform(multipart("/ai/voice-intake").file(audio))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tasks", hasSize(2)))
                .andExpect(jsonPath("$.tasks[0].title").value("Build landing page"))
                .andExpect(jsonPath("$.tasks[1].title").value("Build contact form"));
    }

    private static TaskDto task(UUID projectId, String title, TaskPriority priority) {
        return new TaskDto(UUID.randomUUID(), projectId, title, null,
                TaskStatus.TODO, priority, null, null, null, null, false,
                List.of(), Instant.now(), Instant.now());
    }
}
