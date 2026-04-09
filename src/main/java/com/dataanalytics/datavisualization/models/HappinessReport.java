package com.dataanalytics.datavisualization.models;

import lombok.Data;

@Data
public class HappinessReport {
    private int rank;
    private String country;
    private double score;
    private double gdp;
    private double socialSupport;
    private double lifeExpectancy;
    private double freedom;
    private double generosity;
    private double corruption;
}
