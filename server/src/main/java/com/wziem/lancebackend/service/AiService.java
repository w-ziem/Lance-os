package com.wziem.lancebackend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wziem.lancebackend.api.dto.ai.ExtractedClientData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class AiService {

    private static final String OPENAI_BASE_URL = "https://api.openai.com/v1";

    private String buildSystemPrompt() {
        return """
                You are a business data extractor for a freelance management system.
                Today's date is %s. Use this as the reference point for all relative dates
                (e.g. "end of the month" means the last day of the current month,
                "next week" means the week starting %s, etc.).

                STRICT EXTRACTION RULES — apply before writing any field:
                - Output ONLY values explicitly stated in the transcript. Silence (null) is always correct.
                - budget: null unless the user stated a specific number. Never estimate or infer.
                - deadline: null unless the user stated a specific date or relative day.
                - scheduledDate: null unless the user mentioned a specific day or date for this task.
                - scheduledHour: null unless the user mentioned a specific time of day.
                - email, phone, companyName: null if not mentioned.
                - estimatedHours is the ONLY field where inference is allowed (see examples below).

                Extract structured data from the voice transcript provided by the user.

                Return ONLY valid JSON with these exact camelCase field names:
                {
                  "client": {
                    "name": "string (required — full name or company name)",
                    "email": "string or null",
                    "companyName": "string or null",
                    "phone": "string or null",
                    "notes": "string or null"
                  },
                  "project": {
                    "name": "string (required — infer from work description, e.g. 'Website Development')",
                    "description": "string or null",
                    "deadline": "YYYY-MM-DD or null (future date only; null if not mentioned)",
                    "budget": "number or null (null if not explicitly stated — never estimate)"
                  },
                  "tasks": [
                    {
                      "title": "string (required)",
                      "description": "string or null",
                      "priority": "LOW or MEDIUM or HIGH",
                      "scheduledDate": "YYYY-MM-DD or null (null if no day/date mentioned for this task)",
                      "scheduledHour": "integer 0-23 or null (null if no time mentioned; 24h format)",
                      "estimatedHours": "number or null — infer from task type: quick call=0.5, meeting=1.0, code review=1.5, small feature=2.0, design/planning=3.0-4.0; null only if truly unknowable"
                    }
                  ]
                }

                Rules:
                - tasks may be an empty array [] if no specific tasks were mentioned
                - Return ONLY the JSON object — no markdown fences, no explanation
                """.formatted(LocalDate.now(), LocalDate.now().plusDays(7));
    }

    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public AiService(
            @Value("${app.openai.api-key}") String apiKey,
            @Value("${app.openai.model:gpt-4o-mini}") String model,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl(OPENAI_BASE_URL)
                .build();
        this.objectMapper = objectMapper;
    }

    public String transcribeAudio(MultipartFile audio) {
        try {
            byte[] bytes = audio.getBytes();
            String filename = audio.getOriginalFilename() != null ? audio.getOriginalFilename() : "audio.webm";

            ByteArrayResource audioResource = new ByteArrayResource(bytes) {
                @Override
                public String getFilename() { return filename; }
            };

            LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", audioResource);
            body.add("model", "whisper-1");

            WhisperResponse response = restClient.post()
                    .uri("/audio/transcriptions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(WhisperResponse.class);

            return response != null ? response.text() : "";
        } catch (IOException e) {
            throw new RuntimeException("Failed to read audio bytes", e);
        }
    }

    public ExtractedClientData extractClientData(String transcript) {
        try {
            GptRequest request = new GptRequest(
                    model,
                    List.of(
                            new GptMessage("system", buildSystemPrompt()),
                            new GptMessage("user", transcript)
                    ),
                    new ResponseFormat("json_object")
            );

            GptResponse response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(GptResponse.class);

            if (response == null || response.choices().isEmpty()) {
                throw new RuntimeException("Empty response from OpenAI");
            }

            String json = response.choices().getFirst().message().content();
            log.debug("GPT extraction result: {}", json);
            return objectMapper.readValue(json, ExtractedClientData.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract client data from transcript", e);
        }
    }

    private record WhisperResponse(String text) {}

    private record GptRequest(
            String model,
            List<GptMessage> messages,
            @JsonProperty("response_format") ResponseFormat responseFormat
    ) {}

    private record GptMessage(String role, String content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GptResponse(List<GptChoice> choices) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GptChoice(GptMessage message) {}

    private record ResponseFormat(String type) {}
}
