package com.linkedpipes.lpa.backend.controllers;

import com.linkedpipes.lpa.backend.entities.DataSource;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@SuppressWarnings("unused")
public class DataSourceController {

    @GetMapping("/api/datasources")
    public List<DataSource> getDataSources(){
        return Collections.emptyList();
    }

    @PostMapping("/api/datasources")
    public String createDataSources(@RequestParam(value = "fileUri") String fileUri) {
        return "called POST /datasources";
    }

    @GetMapping("/api/datasource")
    public DataSource getDataSource(@RequestParam(value = "dataSourceUri") String dataSourceUri) {
        DataSource dataSource = new DataSource();
        return dataSource;
    }
    
}
