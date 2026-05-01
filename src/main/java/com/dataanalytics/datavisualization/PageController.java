package com.dataanalytics.datavisualization;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "happiness-index";
    }

    @GetMapping("/sleep-data")
    public String sleepDataPage() {
        return "sleep-data-table";
    }
}
