package com.linkedpipes.lpa.backend;

import com.linkedpipes.lpa.backend.entities.Pipeline;
import com.linkedpipes.lpa.backend.services.HttpUrlConnector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;

@RestController
public class PipelineController {

    private static final Logger logger =
            LoggerFactory.getLogger(DiscoveryController.class);

    private HttpUrlConnector httpUrlConnector = new HttpUrlConnector();

    @RequestMapping("/pipeline")
    @ResponseBody
    public ResponseEntity<Pipeline> getPipeline(@RequestParam( value="pipelineUri") String pipelineUri){
        Pipeline testPipeline = new Pipeline();
        testPipeline.Uri = pipelineUri;
        return new ResponseEntity(testPipeline, HttpStatus.OK);
    }

    @RequestMapping("/pipeline/export")
    @ResponseBody
    public ResponseEntity<String> exportPipeline(@RequestParam( value="discoveryId") String discoveryId, @RequestParam( value="pipelineUri") String pipelineUri) throws IOException{
        String response = httpUrlConnector.sendGetRequest(Application.config.getProperty("discoveryServiceUrl") + "/discovery/" + discoveryId + "/export/" + pipelineUri,
                null, "application/json");

        return ResponseEntity.ok(response);
    }

    @RequestMapping("/pipeline/create")
    @ResponseBody
    public void createPipeline(@RequestParam( value="discoveryId") String discoveryId, @RequestParam( value="pipelineUri") String pipelineUri){

    }

    @RequestMapping("/pipeline/execute")
    public ResponseEntity<String> executePipeline(@RequestParam( value="etlPipelineIri") String etlPipelineIri) throws IOException{
        String response = httpUrlConnector.sendPostRequest(Application.config.getProperty("etlServiceUrl") + "/executions?pipeline=" + etlPipelineIri,
                null, "application/json", "application/json");

        return ResponseEntity.ok(response);
    }

}