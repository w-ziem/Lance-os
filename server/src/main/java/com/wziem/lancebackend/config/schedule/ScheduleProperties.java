package com.wziem.lancebackend.config.schedule;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.schedule")
@Data
public class ScheduleProperties {
    private int workStartHour = 8;
    private int workEndHour = 17;
    private int slotMinutes = 30;
}
