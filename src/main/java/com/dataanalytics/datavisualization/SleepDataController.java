package com.dataanalytics.datavisualization;

import com.dataanalytics.datavisualization.models.SleepData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SleepDataController {
    @Autowired
    private SleepDataService sleepDataService;

    @GetMapping("/sleep-data-all")
    public List<SleepData> getChartData() throws Exception{
        return sleepDataService.getAllData();
    }

    @GetMapping("/sleep-data")
    public String showSleepPage() {
        // This must match the filename src/main/resources/templates/sleep-data-table.html
        return "sleep-data";
    }
}
