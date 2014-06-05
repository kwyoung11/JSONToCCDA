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
var codeSystemNames = {
	"LOINC": "2.16.840.1.113883.6.1", // vital signs,
	"SNOMED CT": "2.16.840.1.113883.6.96", 
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
		"Vital Signs": {
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
			doc.node('ClinicalDocument').attr({"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"})
					.attr({xmlns: "urn:hl7-org:v3"}).attr({"xmlns:cda": "urn:hl7-org:v3"}).attr({"xmlns:sdtc": "urn:hl7-org:sdtc"})
				.node('section')
					.node('templateID').attr({root: sectionToTemplateID["section"]["Vital Signs"]["templateID"]}).parent()
					.node('code').attr({code:  sectionToTemplateID["section"]["Vital Signs"]["code"]})
						.attr({codeSystem: codeSystemNames[sectionToTemplateID["section"]["Vital Signs"]["codeSystemName"]]})
						.attr({displayName: "VITAL SIGNS"}).parent()
					.node('title', "VITAL SIGNS").parent()
					.node('text').parent()
					.node('entry').attr({typeCode: "DRIV"})
				.parent()
			.parent();

			console.log(doc.toString());
		}
	}
}

parseJSONToCCDA(data);





