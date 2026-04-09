package com.dataanalytics.datavisualization;

import com.dataanalytics.datavisualization.models.HappinessReport;
import com.opencsv.CSVReader;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class HappinessService {
    public List<HappinessReport> getAllData(String year) throws Exception{
        List<HappinessReport> happinessReports = new ArrayList<>();

        InputStreamReader isr = new InputStreamReader(new ClassPathResource("happiness_report_" + year + ".csv").getInputStream());

        try (CSVReader csvReader = new CSVReader(isr)) {
            csvReader.readNext();
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                HappinessReport report = new HappinessReport();
                report.setRank(Integer.parseInt(line[0]));
                report.setCountry(line[1]);
                report.setScore(Double.parseDouble(line[2]));
                report.setGdp(Double.parseDouble(line[3]));
                report.setLifeExpectancy(Double.parseDouble(line[4]));

                happinessReports.add(report);
            }
        }
        return happinessReports;
    }
}
