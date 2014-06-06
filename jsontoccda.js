/*
This script converts CCDA data in JSON format (originally generated from a Continuity of Care Document (CCD) in 
standard XML/CCDA format) back to XML/CCDA format. In order to re-build the CCD accurately, the script determines the 
section template to which the data belongs to by analyzing its value set codes. In other words, if the JSON data contains 
a value set belonging to a certain section, then it must belong to that section since different sections do not have the 
same value sets.

For example, if the JSON data contains an entry with a code of 8302-2 (which belongs to the value set "Height"), then that 
entry must be a descendant of the Vital Signs section template since the Vital Signs section contains such a value set, as 
specified by the CCDA standard (available at http://www.hl7.org/implement/standards/product_brief.cfm?product_id=258).

Once the section template is determined, an XML document is generated using the libxmljs Document API and passing in the 
appropriate XML attributes for the section template determined previously.
*/

var libxmljs = require("libxmljs");
var CCDA = require("blue-button-meta");

var data = [
            {
                "identifiers": [
                    {
                        "identifier": "c6f88321-67ad-11db-bd13-0800200c9a66"
                    }
                ],
                "status": "completed",
                "date": [
                    {
                        "date": "1999-11-14T00:00:00.000Z",
                        "precision": "day"
                    }
                ],
                "freeTextValue": "177 cm",
                "interpretations": [
                    "Normal"
                ],
                "name": "Height",
                "code": "8302-2",
                "code_system_name": "LOINC",
                "value": 177,
                "unit": "cm"
            },
            {
                "identifiers": [
                    {
                        "identifier": "c6f88321-67ad-11db-bd13-0800200c9a66"
                    }
                ],
                "status": "completed",
                "date": [
                    {
                        "date": "1999-11-14T00:00:00.000Z",
                        "precision": "day"
                    }
                ],
                "freeTextValue": "86 kg",
                "interpretations": [
                    "Normal"
                ],
                "name": "Patient Body Weight - Measured",
                "code": "3141-9",
                "code_system_name": "LOINC",
                "value": 86,
                "unit": "kg"
            },
            {
                "identifiers": [
                    {
                        "identifier": "c6f88321-67ad-11db-bd13-0800200c9a66"
                    }
                ],
                "status": "completed",
                "date": [
                    {
                        "date": "1999-11-14T00:00:00.000Z",
                        "precision": "day"
                    }
                ],
                "freeTextValue": "132/86 mmHg",
                "interpretations": [
                    "Normal"
                ],
                "name": "Intravascular Systolic",
                "code": "8480-6",
                "code_system_name": "LOINC",
                "value": 132,
                "unit": "mm[Hg]"
            },
            {
                "identifiers": [
                    {
                        "identifier": "c6f88321-67ad-11db-bd13-0800200c9a66"
                    }
                ],
                "status": "completed",
                "date": [
                    {
                        "date": "2000-04-07T00:00:00.000Z",
                        "precision": "day"
                    }
                ],
                "freeTextValue": "177 cm",
                "interpretations": [
                    "Normal"
                ],
                "name": "Height",
                "code": "8302-2",
                "code_system_name": "LOINC",
                "value": 177,
                "unit": "cm"
            },
            {
                "identifiers": [
                    {
                        "identifier": "c6f88321-67ad-11db-bd13-0800200c9a66"
                    }
                ],
                "status": "completed",
                "date": [
                    {
                        "date": "2000-04-07T00:00:00.000Z",
                        "precision": "day"
                    }
                ],
                "freeTextValue": "88 kg",
                "interpretations": [
                    "Normal"
                ],
                "name": "Patient Body Weight - Measured",
                "code": "3141-9",
                "code_system_name": "LOINC",
                "value": 88,
                "unit": "kg"
            },
            {
                "identifiers": [
                    {
                        "identifier": "c6f88321-67ad-11db-bd13-0800200c9a66"
                    }
                ],
                "status": "completed",
                "date": [
                    {
                        "date": "2000-04-07T00:00:00.000Z",
                        "precision": "day"
                    }
                ],
                "freeTextValue": "145/88 mmHg",
                "interpretations": [
                    "Normal"
                ],
                "name": "Intravascular Systolic",
                "code": "8480-6",
                "code_system_name": "LOINC",
                "value": 145,
                "unit": "mm[Hg]"
            }
        ]

/* 
This data structure delineates the value set codes for each possible section template in a CCD. 
See sectionNumberToSectionName data structure for order. 
*/
var valueSetCodesToSection = [[],[],[],[],[],[],[],["9279-1", "8867-4", "2710-2", "8480-6", "8462-4", 
"8310-5", "8302-2", "8306-3", "8287-5", "3141-9", "39156-5", "3140-1"]];

var codesToData = {"8310-5":{"Concept Code":"8310-5","Concept Name":"Body Temperature","Preferred Concept Name":"Body temperature:Temp:Pt:^Patient:Qn:","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null},"8462-4":{"Concept Code":"8462-4","Concept Name":"BP Diastolic","Preferred Concept Name":"Intravascular diastolic:Pres:Pt:Arterial system:Qn:","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null},"8480-6":{"Concept Code":"8480-6","Concept Name":"BP Systolic","Preferred Concept Name":"Intravascular systolic:Pres:Pt:Arterial system:Qn:","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null},"8287-5":{"Concept Code":"8287-5","Concept Name":"Head Circumference","Preferred Concept Name":"Circumference.occipital-frontal:Len:Pt:Head:Qn:Tape measure","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null},"8867-4":{"Concept Code":"8867-4","Concept Name":"Heart Rate","Preferred Concept Name":"Heart beat:NRat:Pt:XXX:Qn:","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null},"8302-2":{"Concept Code":"8302-2","Concept Name":"Height","Preferred Concept Name":"Body height:Len:Pt:^Patient:Qn:","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null},"8306-3":{"Concept Code":"8306-3","Concept Name":"Height (Lying)","Preferred Concept Name":"Body height^lying:Len:Pt:^Patient:Qn:","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null},"2710-2":{"Concept Code":"2710-2","Concept Name":"O2 % BldC Oximetry","Preferred Concept Name":"Oxygen saturation:SFr:Pt:BldC:Qn:Oximetry","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null},"9279-1":{"Concept Code":"9279-1","Concept Name":"Respiratory Rate","Preferred Concept Name":"Breaths:NRat:Pt:Respiratory system:Qn:","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null},"3141-9":{"Concept Code":"3141-9","Concept Name":"Weight Measured","Preferred Concept Name":"Body weight:Mass:Pt:^Patient:Qn:Measured","Preferred Alternate Code":null,"Code System OID":"2.16.840.1.113883.6.1","Code System Name":"LOINC","Code System Code":"PH_LOINC","Code System Version":"2.32","HL7 Table 0396 Code":"LN","Value Set Name":"Vital Sign Result Value Set","Value Set Code":"PHVS_VitalSignResult_HITSP","Value Set OID":"2.16.840.1.113883.3.88.12.80.62","Value Set Version":"1","Value Set Definition":"This identifies the vital sign result type","Value Set Status":"Published","VS Last Updated Date":"7/23/09","VS Release Comments":null}}


var valueSetOIDToSection = {
    "2.16.840.1.113883.3.88.12.80.62": ["2.16.840.1.113883.10.20.22.2.4", "2.16.840.1.113883.10.20.22.2.4.1"]
}


// Map section number to section name and specify order for valueSetCodesToSections parallel array
var sectionNumberToSectionName = {
	1: "allergies",
	2: "medications",
	3: "problems",
	4: "procedures",
	5: "lab results",
	6: "encounters",
	7: "immunizations",
	8: "vitals"
}

/*
This data structure maps code system names to code systems identifiers.
*/
var codeSystems = {
	"LOINC": ["2.16.840.1.113883.6.1", "8716-3"], // vital signs,
	"SNOMED CT": ["2.16.840.1.113883.6.96", "46680005"], 
	"RxNorm": "2.16.840.1.113883.6.88",
	"ActCode": "2.16.840.1.113883.5.4", // allergies
	"CPT-4": "2.16.840.1.113883.6.12", // encounters
	"CVX": "2.16.840.1.113883.12.292" // immunizations
	
}

/*
This data structure maps section templates to templateID's, code's and codeSystemName's.
*/
var sectionToTemplateID = {
	"section": {
		7: {
			"templateID": "2.16.840.1.113883.10.20.22.2.4",
			"code": "8716-3",
			"codeSystemName": "LOINC" 
		} 
	}
}

/*
This function takes JSON data as a parameter, determines its section template, then generates an 
XML document appropriate to that section.

@data the JSON data to be converted to XML/CCDA
*/
function parseJSONToCCDA(data) {
	var codeNumber = data[0]["code"];
	var sectionNumber = -1; 

	// determine what section template the data belongs to
	for (var i = 0; i < valueSetCodesToSection.length; i++) {
		for (var j = 0; j < valueSetCodesToSection[i].length; j++) {
			if (valueSetCodesToSection[i][j] == codeNumber) {
				sectionNumber = i;
			}
		}
	}

	if (sectionNumber != -1) { // then we've found a section for it
		if (sectionNumber == 7) { // VITAL SIGNS
			// build vital signs section
			var doc = new libxmljs.Document();
			var top = doc.node('ClinicalDocument').attr({"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"})
					.attr({xmlns: "urn:hl7-org:v3"}).attr({"xmlns:cda": "urn:hl7-org:v3"}).attr({"xmlns:sdtc": "urn:hl7-org:sdtc"})
				.node('section')
					.node('templateID').attr({root: CCDA.sections[sectionNumber].templateIds[0]}).parent()
                    .node('templateID').attr({root: CCDA.sections[sectionNumber].templateIds[1]}).parent()
					.node('code').attr({code: codeSystems[data[0]["code_system_name"]][1] })
						.attr({codeSystem: codeSystems[data[0]["code_system_name"]][0]})
                        .attr({codeSystemName: data[0]["code_system_name"]})
						.attr({displayName: "VITAL SIGNS"}).parent()
					.node('title', "VITAL SIGNS").parent()
					.node('text').parent()
					.node('entry').attr({typeCode: "DRIV"})
                        .node('organizer').attr({classCode: "CLUSTER"}).attr({moodCode: "EVN"})
                            .node('templateId').attr({root: 'TODO'})
                            .node('id').attr({root: data[0]["identifiers"][0]["identifier"]})
                            .node('code')
                                .attr({code: codeSystems["SNOMED CT"][1] })
                                .attr({codeSystem: codeSystems["SNOMED CT"][0] })
                                .attr({codeSystemName: "SNOMED CT"})
                                .attr({displayName: 'Vital signs'}).parent()
                            .node('statusCode').attr({code: data[0]['status']}).parent()
                            .node('effectiveTime').attr({value: 'TODO'})

                            for (var i = 0; i < data.length; i++) {
                                top.node('component')
                                    .node('observation').attr({classCode: "OBS"}).attr({moodCode: "EVN"})
                                        .node('templateId').attr({root: "TODO"})
                                        .node('id').attr({root: data[i]['identifiers'][0]['identifier']})
                                        .node('code').attr({code: codeSystems[data[i]["code_system_name"]][1] })
                                            .attr({codeSystem: codeSystems[data[i]["code_system_name"]][0]})
                                            .attr({codeSystemName: data[i]["code_system_name"]})
                                            .attr({displayName: data[i]['name']}).parent()
                                        .node('text')
                                            .node('reference').attr({value: "#vit" + i}).parent()
                                        .parent()
                                        .node('statusCode').attr({code: data[i]['status']}).parent()
                                        .node('effectiveTime').attr({value: "TODO"}).parent()
                                        .node('value').attr({"xsi:type": "PQ"}).attr({value: data[i]["value"]}).attr({unit: data[i]["unit"]}).parent()
                                        .node('interpretationCode').attr({code: "N"}).attr({codeSystem: "2.16.840.1.113883.5.83"}).parent()
                                    .parent()
                                .parent()
                            }
				top.parent()
			.parent();

			console.log(doc.toString());
		}
	}
}

parseJSONToCCDA(data);

console.log(CCDA.statements);



