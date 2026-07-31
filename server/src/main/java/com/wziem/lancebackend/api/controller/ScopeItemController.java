package com.wziem.lancebackend.api.controller;

import com.wziem.lancebackend.api.dto.scope.CreateScopeItemRequest;
import com.wziem.lancebackend.api.dto.scope.ScopeItemDto;
import com.wziem.lancebackend.api.dto.scope.ScopeSummaryDto;
import com.wziem.lancebackend.api.dto.scope.UpdateScopeItemRequest;
import com.wziem.lancebackend.service.ScopeItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects/{projectId}/scope-items")
@RequiredArgsConstructor
public class ScopeItemController {

    private final ScopeItemService scopeItemService;

    @GetMapping
    public ResponseEntity<List<ScopeItemDto>> listScopeItems(@PathVariable UUID projectId) {
        return ResponseEntity.ok(scopeItemService.listByProject(projectId));
    }

    @GetMapping("/summary")
    public ResponseEntity<ScopeSummaryDto> getScopeSummary(@PathVariable UUID projectId) {
        return ResponseEntity.ok(scopeItemService.getSummary(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScopeItemDto> getScopeItem(
            @PathVariable UUID projectId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(scopeItemService.get(projectId, id));
    }

    @PostMapping
    public ResponseEntity<ScopeItemDto> createScopeItem(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateScopeItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scopeItemService.create(projectId, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ScopeItemDto> updateScopeItem(
            @PathVariable UUID projectId,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateScopeItemRequest request
    ) {
        return ResponseEntity.ok(scopeItemService.update(projectId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScopeItem(
            @PathVariable UUID projectId,
            @PathVariable UUID id
    ) {
        scopeItemService.delete(projectId, id);
        return ResponseEntity.noContent().build();
    }
}
