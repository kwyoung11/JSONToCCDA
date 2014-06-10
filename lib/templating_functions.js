// socialHistory
var insertObservation = function(xmlDoc, templateId, id, code, codeSystem, displayName, reference, timeArr, value) {
    return xmlDoc.node('entry').attr({typeCode: "DRIV"})
            .node('observation').attr({classCode: "OBS"}).attr({moodCode: "EVN"}) // social history observation
                .node('templateId').attr({root: "2.16.840.1.113883.10.20.22.4.38"}).parent()
                .node('id').attr({root: "9b56c25d-9104-45ee-9fa4-e0f3afaa01c1"}).parent()
                .node('code')
                    .attr({code: "229819007" })
                    .attr({codeSystem: "2.16.840.1.113883.6.96" })
                    .attr({displayName: displayName}).parent()
                .node('originalText')
                    .node('reference').attr({value: "#soc1"}).parent()
                .parent()
                .node('statusCode').attr({code: 'completed'}).parent()
                .node('effectiveTime')
                    .node('low').attr({value: timeArr[0]}).parent()
                    .node('high').attr({value: timeArr[1]}).parent()
                .parent()
                .node('value', '1 pack per day').attr({"xsi:type": "ST"}).parent()
            .parent()
        .parent()
}

var header = function(doc, templateIdOptional, templateIdRequired, code, codeSystem, codeSystemName, displayName, title) {
    var ret = doc.node('ClinicalDocument').attr({"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"})
        .attr({xmlns: "urn:hl7-org:v3"}).attr({"xmlns:cda": "urn:hl7-org:v3"}).attr({"xmlns:sdtc": "urn:hl7-org:sdtc"})
        .node('section')
            .node('templateID').attr({root: templateIdOptional}).parent();

            if (templateIdRequired != undefined) {
                ret.node('templateID').attr({root: templateIdRequired}).parent();
            }

            if (codeSystemName != undefined) {
                ret.node('code').attr({code: code })
                    .attr({codeSystem: codeSystem})
                    .attr({codeSystemName: codeSystemName})
                    .attr({displayName: displayName}).parent()
            } else {
                ret.node('code').attr({code: code })
                    .attr({codeSystem: codeSystem})
                    .attr({codeSystemName: codeSystemName})
                    .attr({displayName: displayName}).parent()
            }
            ret.node('title', title).parent()
            .node('text').parent()
    return ret;
}

module.exports.insertObservation = insertObservation;
module.exports.header = header;