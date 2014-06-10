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

var addr = function(xmlDoc, addr) {
    if (addr == undefined) {
        xmlDoc = xmlDoc.node('addr').attr({nullFlavor: "UNK"}).parent()
    } else {
        xmlDoc = xmlDoc.node('addr')
            .node('streetAddressLine', addr["streetLines"][0]).parent()
            .node('city', addr["city"]).parent()
            .node('state', addr["state"]).parent()
            .node('postalCode', addr["zip"]).parent()
            .node('country', addr["country"]).parent()
        .parent()    
    }
    return xmlDoc;
}

var performer = function(xmlDoc, id, extension, addrP, tel, repOrg) {
    xmlDoc = xmlDoc.node('performer')
        .node('assignedEntity')
            .node('id').attr((id == undefined) ? {nullFlavor: "NI"} : {root: id})
                       .attr( (extension == undefined) ? {extension: ""} : { extension: extension }).parent();
            xmlDoc = addr(xmlDoc, addrP);
            xmlDoc.node('telecom').attr({use: "WP"}).attr( (tel == undefined) ? {nullFlavor: "UNK"} : {value: tel["value"]}).parent();
            xmlDoc = representedOrganization(xmlDoc, repOrg);
        xmlDoc = xmlDoc.parent()
    .parent()
    return xmlDoc;
}

// var id = function(xmlDoc, id) {
//     if (id == undefined) {
//         return xmlDoc.node('id').attr({nullFlavor: "NI"})
//     }
// }



var representedOrganization = function(xmlDoc, org) {
    xmlDoc = xmlDoc.node('representedOrganization')
        .node('id').attr({root: "2.16.840.1.113883.19.5"}).parent()
        .node('name', org["name"]).parent()
        .node('telecom').attr( (org["telecom"] == undefined) ? {nullFlavor: "UNK"} : {value: org["telecom"]["value"]}).parent();
        if (org["address"] == undefined) {
            xmlDoc = xmlDoc.node('addr').attr({nullFlavor: "UNK"}).parent();
        } else {
            xmlDoc = addr(xmlDoc, org["address"]);
        }       
    xmlDoc = xmlDoc.parent()
    return xmlDoc;
}

var getTimes = function(length, date) {
    var timeArr = [];
    for (var k = 0; k < length; k++) {
        var effectiveTime = date[k]["date"].split("-");
        effectiveTime[2] = effectiveTime[2].slice(0,2);
        var time = effectiveTime[0] + effectiveTime[1] + effectiveTime[2];
        timeArr.push(time);
    }
    return timeArr;

}

// var participant = function(xmlDoc, participant) {

// }

module.exports.insertObservation = insertObservation;
module.exports.header = header;
module.exports.addr = addr;
module.exports.representedOrganization = representedOrganization;
module.exports.performer = performer;
module.exports.getTimes = getTimes;