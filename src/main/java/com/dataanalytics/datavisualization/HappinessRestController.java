package com.dataanalytics.datavisualization;

import com.dataanalytics.datavisualization.models.HappinessReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class HappinessRestController {
    @Autowired
    private HappinessService happinessService;

    @GetMapping("/happiness-data")
    public List<HappinessReport> getChartData(@RequestParam(defaultValue = "2019") String year) throws Exception{
        return happinessService.getAllData(year);
    }
}
