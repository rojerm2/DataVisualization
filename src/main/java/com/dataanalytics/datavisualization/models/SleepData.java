package com.dataanalytics.datavisualization.models;

import lombok.Data;
    @Data
    public class SleepData {
        private int personId;
        private String gender;
        private int age;
        private String occupation;
        private double sleepDuration;
        private int sleepQuality;
        private int physicalActivity;
        private int stressLevel;
        private String bmiCategory;
        private String bloodPressure;
        private int heartRate;
        private int dailySteps;
        private String sleepDisorder;
}
