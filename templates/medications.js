var libxmljs = require("libxmljs");


function writeXML(sectionNumber, data, codeSystems) {
    var xml = {};
    if (sectionNumber == 1) {
        xml = loadMedications(sectionNumber, data, codeSystems);
    }
    return xml;
}


function loadMedications(sectionNumber, data, codeSystems) {
     // determining the number of entries
    var entriesArr = [];
    var entries = {};
    for (var i = 0; i < data.length; i++) {
        entriesArr[i] = data[i]["date"][0]["date"].slice(0,4);
        entries[entriesArr[i]] = i + 1;
    }
    var uniqueEntries = entriesArr.filter(function(v,i) { return i == entriesArr.lastIndexOf(v); });

    for (var i = 1; i < uniqueEntries.length; i++) {
        entries[uniqueEntries[i]] = entries[uniqueEntries[i]] - entries[uniqueEntries[i-1]];
    }

    // allergy problem act
    var doc = new libxmljs.Document();
    var xmlDoc = doc.node('ClinicalDocument').attr({"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"})
        .attr({xmlns: "urn:hl7-org:v3"}).attr({"xmlns:cda": "urn:hl7-org:v3"}).attr({"xmlns:sdtc": "urn:hl7-org:sdtc"})
        .node('section')
            .node('templateID').attr({root: "2.16.840.1.113883.10.20.22.2.1"}).parent()
            .node('templateID').attr({root: "2.16.840.1.113883.10.20.22.2.1.1"}).parent()
            .node('code').attr({code: "10160-0" })
                .attr({codeSystem: "2.16.840.1.113883.6.1"})
                .attr({codeSystemName: "LOINC"})
                .attr({displayName: "HISTORY OF MEDICATION USE"}).parent()
            .node('title', "MEDICATIONS").parent()
            .node('text').parent()

            // entries loop
            for (var i = 0; i < uniqueEntries.length; i++) {
                var effectiveTime = data[i]["date"][0]["date"].split("-");
                effectiveTime[2] = effectiveTime[2].slice(0,2);
                var time = effectiveTime[0] + effectiveTime[1] + effectiveTime[2];
                var organizer = xmlDoc.node('entry').attr({typeCode: "DRIV"})
                                      .node('substanceAdministration').attr({classCode: "SBADM"}).attr({moodCode: "EVN"});

                    // medication activity
                    organizer.node('templateId').attr({root: "2.16.840.1.113883.10.20.22.4.16"}).parent()
                        .node('id').attr({root: data[0]["identifiers"][0]["identifier"]}).parent()
                        .node('text', data[i]["product"]["unencoded_name"])
                            .node('reference').attr({value: "#MedSec_1"}).parent()
                        .parent()
                        .node('statusCode').attr({code: 'completed'}).parent()
                        .node('effectiveTime').attr({"xsi:type": "IVL_TS" })
                            .node('low').attr({value: time})
                            .node('high').attr({value: time})
                        .parent()
                        .node('effectiveTime').attr({"xsi:type": "PIVL_TS" }).attr({institutionSpecified: "true"]}).attr({operator: "A"})
                            .node('period').attr({value: "6"}).attr({unit: "h"}).parent()
                        .parent()
                        .node('routeCode').attr({code: data[i]['administration']['route']['code']})
                                          .attr({codeSystem: "2.16.840.1.113883.3.26.1.1"})
                                          .attr({codeSystemName: data[i]["administration"]["route"]["code_system_name"]})
                                          .attr({displayName: data[i]["administration"]["route"]["name"]})
                        .node('doseQuantity').attr({value: data[i]["administration"]["dose"]["value"]})
                                             .attr({unit: data[i]["administration"]["dose"]["unit"]}).parent()
                        .node('rateQuantity').attr({value: }).attr({unit: }).parent()
                        .node('maxDoseQuantity').attr({nullFlavor: "UNK"}).parent()
                            .node('numerator').attr({nullFlavor: "UNK"}).parent()
                            .node('denominator').attr({nullFlavor: "UNK"}).parent()
                        .parent()
                        .node('administrationUnitCode').attr({code: data[i]["administration"]["form"]["code"]})
                                                     .attr({displayName: data[i]["administration"]["form"]["name"]})
                                                     .attr({codeSystem: "2.16.840.1.113883.3.26.1.1"})
                                                     .attr({data[i]["administration"]["form"]["code_system_name"]}).parent()
                        .node('consumable')
                            .node('manufacturedProduct').attr({classCode: "MANU"}) // medication information
                                .node('templateId').attr({root: "2.16.840.1.113883.10.20.22.4.23"})
                                .node('id').attr({root: data[i]["product"]["identifiers"]["identifier"]}).parent()
                                .node('manufacturedMaterial')
                                    .node('code').attr({code: data[i]["product"]["code"]})
                                                 .attr({codeSystem: "2.16.840.1.113883.6.88"})
                                                 .attr({displayName: data[i]["product"]["name"]})
                                        .node('originalText')
                                            .node('reference').attr({value: '#MedSec_1'}).parent()
                                        .parent()
                                        .node('translation').attr({code: data[i]["product"]["translations"]["code"]})
                                                            .attr({displayName: data[i]["product"]["translations"]["name"]})
                                                            .attr({codeSystem: codeSystems[data[i]["product"]["code_system_name"]]})
                                                            .attr({codeSystemName: data[i]["product"]["code_system_name"]}).parent()
                                    .parent()
                                .parent()
                                .node('manufacturerOrganization')
                                    .node('name', "Medication Factory Inc.").parent()
                                .parent()
                            .parent()
                        .parent()






                        var observation = organizer.node('entryRelationship').attr({typeCode: "SUBJ"}).attr({inversionInd: "true"})
                            .node('observation').attr({classCode: "OBS"}).attr({moodCode: "EVN"})
                                .node('templateId').attr({root: "2.16.840.1.113883.10.20.22.4.7"}).parent() // allergy observation
                                .node('id').attr({root: data[0]["identifiers"][0]["identifier"]}).parent()
                                .node('code').attr({code: "ASSERTION"}).attr({codeSystem: "2.16.840.1.113883.5.4"}).parent()
                                .node('statusCode').attr({code: 'completed'})
                                .node('effectiveTime')
                                    .node('low').attr({value: time}).parent()
                                .parent()
                                .node('value').attr({"xsi:type": "CD"})
                                              .attr({code: "419511003"})
                                              .attr({displayName: "Propensity to adverse reactions to drug"})
                                              .attr({codeSystem: "2.16.840.1.113883.6.96"})
                                              .attr({codeSystemName: "SNOMED CT"}).parent()
                                .node('originalText')
                                    .node('reference').attr({value: "#reaction" + i}).parent()
                                .parent()
                                .node('participant').attr({typeCode: "CSM"})
                                    .node('participantRole').attr({classCode: "MANU"})
                                        .node('playingEntity').attr({classCode: "MMAT"})
                                            .node('code').attr({code: data[i]["code"]})
                                                         .attr({displayName: data[i]["name"]})
                                                         .attr({codeSystem: codeSystems[data[i]["code_system_name"]]})
                                                         .attr({codeSystemName: data[0]["code_system_name"]})
                                                .node('originalText')
                                                    .node('reference').attr({value: "#reaction" + i}).parent()
                                                .parent()
                                            .parent()
                                        .parent()
                                    .parent()
                                .parent()

                        // entryRelationship's loop
                        for (var j = 0; j < entries[uniqueEntries[i]]; j++) {
                            observation.node('entryRelationship').attr({typeCode: "SUBJ"}).attr({inversionInd: "true"})
                                .node('observation').attr({classCode: "OBS"}).attr({moodCode: "EVN"}) // Allergy status observation
                                    .node('templateId').attr({root: "2.16.840.1.113883.10.20.22.4.28"}).parent()
                                    .node('code').attr({code: "33999-4" })
                                        .attr({codeSystem: "2.16.840.1.113883.6.1" })
                                        .attr({codeSystemName: "LOINC" })
                                        .attr({displayName: "Status"}).parent()
                                    .node('statusCode').attr({code: 'completed'}).parent()
                                    .node('value')
                                        .attr({"xsi:type": "CE"})
                                        .attr({code: "73425007"})
                                        .attr({codeSystem: "2.16.840.1.113883.6.96"})
                                        .attr({displayName: "Inactive"})
                                    .parent()
                                .parent()
                            .parent()
                            .node('entryRelationship').attr({typeCode: "MFST"}).attr({inversionInd: "true"})
                                .node('observation').attr({classCode: "OBS"}).attr({moodCode: "EVN"}) // Allergy status observation
                                    .node('templateId').attr({root: "2.16.840.1.113883.10.20.22.4.9"}).parent()
                                    .node('id').attr({root: data[i]["identifiers"][0]["identifier"]}).parent()
                                    .node('code').attr({nullFlavor: "NA"}).parent()
                                    .node('text')
                                        .node('reference').attr({value: "#reaction" + j}).parent()
                                    .parent()
                                    .node('statusCode').attr({code: 'completed'}).parent()
                                    .node('effectiveTime')
                                        .node('low').attr({value: time}).parent()
                                        .node('high').attr({value: "TODO"}).parent()
                                    .parent()
                                    .node('value')
                                        .attr({"xsi:type": "CD"})
                                        .attr({code: data[i]["reaction"]["code"]})
                                        .attr({codeSystem: "2.16.840.1.113883.6.96"})
                                        .attr({displayName: "Nausea"}).parent()
                                    .node('entryRelationship').attr({typeCode: "SUBJ"}).attr({inversionInd: "true"})
                                        .node('observation').attr({classCode: "OBS"}).attr({moodCode: "EVN"}) // Severity Observation
                                            .node('templateId').attr({root: "2.16.840.1.113883.10.20.22.4.28"}).parent()
                                            .node('code').attr({code: "SEV" })
                                            .attr({displayName: "Severity Observation"})
                                            .attr({codeSystem: "2.16.840.1.113883.5.4" })
                                            .attr({codeSystemName: "ActCode" }).parent()
                                            .node('text')
                                                .node('reference').attr({value: "#severity" + j}).parent()
                                            .parent()
                                            .node('statusCode').attr({code: 'completed'}).parent()
                                            .node('value')
                                                .attr({"xsi:type": "CD"})
                                                .attr({code: "LOOKUP"})
                                                .attr({codeSystem: "2.16.840.1.113883.6.96"})
                                                .attr({codeSystemName: "SNOMED CY" }).parent()
                                            .node('interpretationCode')
                                                .attr({code: "S"})
                                                .attr({displayName: 'Susceptible'})
                                                .attr({codeSystem: "2.16.840.1.113883.10.20.22.4.8"})
                                                .attr({codeSystemName: "Observation Interpretation" }).parent()
                                        .parent()
                                    .parent()
                                .parent()
                                .node('entryRelationship').attr({typeCode: "SUBJ"}).attr({inversionInd: "true"})
                                    .node('observation').attr({classCode: "OBS"}).attr({moodCode: "EVN"}) // Severity Observation
                                        .node('templateId').attr({root: "2.16.840.1.113883.10.20.22.4.28"}).parent()
                                        .node('code').attr({code: "SEV" })
                                        .attr({displayName: "Severity Observation"})
                                        .attr({codeSystem: "2.16.840.1.113883.5.4" })
                                        .attr({codeSystemName: "ActCode" }).parent()
                                        .node('text')
                                            .node('reference').attr({value: "#severity" + j}).parent()
                                        .parent()
                                        .node('statusCode').attr({code: 'completed'}).parent()
                                        .node('value')
                                            .attr({"xsi:type": "CD"})
                                            .attr({code: "LOOKUP"})
                                            .attr({codeSystem: "2.16.840.1.113883.6.96"})
                                            .attr({codeSystemName: "SNOMED CY" }).parent()
                                        .node('interpretationCode')
                                            .attr({code: "N"})
                                            .attr({displayName: 'Normal'})
                                            .attr({codeSystem: "2.16.840.1.113883.1.11.78"})
                                            .attr({codeSystemName: "Observation Interpretation" }).parent()
                                    .parent()
                                .parent()
                            .parent()
                        .parent()
                    .parent()
                .parent()                 
            }
        xmlDoc.parent()
            .parent()
    }   
    xmlDoc.parent() // end section
        .parent(); // end clinicalDocument
    return doc;
}

module.exports = function() {
    return writeXML(arguments["0"], arguments["1"], arguments["2"]);
}

