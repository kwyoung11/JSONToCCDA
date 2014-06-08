blue-button-meta
================

Metadata about Blue Button format (CCDA) internal structures

##Usage

``` javascript
var CCDA = require("blue-button-meta").CCDA;

//CCDA Document OID
console.log(CCDA.document.templateId);

//list of CCDA Templates and their OIDs
console.log(CCDA.templates);

//list of CCDA Sections and their OIDs
console.log(CCDA.sections);

//list of CCDA Clinical Statements and their OIDs
console.log(CCDA.statements);

//list of CCDA constraints
console.log(CCDA.constraints.templates);
console.log(CCDA.constraints.sections);

```
