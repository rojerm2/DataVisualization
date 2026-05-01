package com.dataanalytics.datavisualization;

import com.dataanalytics.datavisualization.models.HappinessReport;
import com.dataanalytics.datavisualization.models.SleepData;
import com.opencsv.CSVReader;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class SleepDataService {
    public List<SleepData> getAllData() throws Exception{
        List<SleepData> sleepDataArrayList = new ArrayList<>();

        InputStreamReader isr = new InputStreamReader(new ClassPathResource("Sleep_health_and_lifestyle_dataset.csv").getInputStream());

        try (CSVReader csvReader = new CSVReader(isr)) {
            csvReader.readNext();
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                SleepData sleepData = new SleepData();

                sleepData.setPersonId(Integer.parseInt(line[0]));
                sleepData.setGender(line[1]);
                sleepData.setAge(Integer.parseInt(line[2]));
                sleepData.setOccupation(line[3]);
                sleepData.setSleepDuration(Double.parseDouble(line[4]));
                sleepData.setSleepQuality(Integer.parseInt(line[5]));
                sleepData.setPhysicalActivity(Integer.parseInt(line[6]));
                sleepData.setStressLevel(Integer.parseInt(line[7]));
                sleepData.setBmiCategory(line[8]);
                sleepData.setBloodPressure(line[9]);
                sleepData.setHeartRate(Integer.parseInt(line[10]));
                sleepData.setDailySteps(Integer.parseInt(line[11]));
                sleepData.setSleepDisorder(line[12]);

                sleepDataArrayList.add(sleepData);
            }
        }
        return sleepDataArrayList;
    }
}
