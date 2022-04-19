/////////////////////////////////////////////////
///////  MODEL DATA AND SETTINGS OBJECTS  /////// 
/////////////////////////////////////////////////

    // declare the data object before loading consumption.js 
    const data = {}

    const dataOutput = {}
    const configOutput = {}


    // Model data object: input data
    const dataModel = {
        consumption:            {},
        siteMeta:               [],
        schema: {
            baselineYear:           '',
            consumption:            {},
            dataSets:{      // Allocation of "Dataset (source) to emissions source
                "776":          {name: "Small sites electricity",           type: "ELEC"    },
                "777":          {name: "Large sites electricity",           type: "ELEC"    },
                "C349":         {name: "LPG contract",                      type: "LPG"     },
                "C4000":        {name: "Natural gas contract",              type: "NG"      }, 
                "H2O/HW":       {name: "Unknown water contract",            type: "WATER"   }, 
                "H2O/SW":       {name: "Unknown water contract",            type: "WATER"   }, 
                "SW/SW":        {name: "Sydney water",                      type: "WATER"   }, 
                "SW/HW":        {name: "Sydney/Hunter water",               type: "WATER"   }, 
                "SW/SW":        {name: "Sydney water",                      type: "WATER"   }, 
                "OFF/WATER":    {name: "Off contract water",                type: "WATER"   }, 
                "OFF/ELEC":     {name: "Off contract electricity",          type: "ELEC"    },
                "OFF/LPG":      {name: "Off contract LPG",                  type: "LPG"     },  
                "OFF/NG":       {name: "Off contract natural gas",          type: "NG"      },
                "OFF/WASTE":    {name: "Off contract waste (various)",      type: "CI_WASTE"},      // A match is done based on only the first characters

                "WOA/ELEC":     {name: "WoA Electricity",                   type: "ELEC"    },
                "WOA/LPG":      {name: "WoA LPG",                           type: "LPG"     },  
                "WOA/NG":       {name: "WoA Natural gas",                   type: "NG"      },
                "WOA/WATER":    {name: "WoA Water",                         type: "WATER"   },
                "WOA/WASTE":    {name: "WoA Waste",                         type: "CI_WASTE"},
            },
            unitConversion:{
                MWh: {
                        "MWh":      1,
                        "kWh":      0.001
                },
                GJ: {
                        "GJ":       1,          
                        "MJ":       0.001                       
                },
                kL: {
                        "kL":       1,                      
                        "kl":       1,                      
                        "l":        0.001,                          
                        "L":        0.001,                          
                        "litres":   0.001,                          
                },
                tonnes: {
                    "General waste-Cubic metres":       1, 
                    "General waste-Litres":             0.001,
                    "General waste-Tonnes":             1,
                    "Landfill-Cubic metres":            1.2 / 3,
                    "Landfill-Litres":                  0.001,
                    "Landfill-Tonnes":                  1,
                    "tonnes":                           1
                }   
            },
            clusterMapping:     {
                clusterList:                    [],
                agencyList:                     [],
                agencyToCluster:                {}
            },
            typologyMapping:    {
                modelSitetypeToSitegroup :      {}
            }, 
            grepProjects:           {}
        },
        sitegroupAgency:        {}
    }
    const helpers = {
        parseTimeA:         d3.timeParse("%d/%m/%Y"),
        parseTimeB:         d3.timeParse("%d/%m/%y")
    }

    let loadedDataType

    const gSheetTables = {
        typologySchema:         'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=47239118&single=true&output=tsv',
        siteData:               'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=1010190784&single=true&output=tsv',
        globalParameters : 		'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=1487208546&single=true&output=tsv', 
        temporalParameters:     'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=719115374&single=true&output=tsv',
        emissionParameters: 	'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=2020752403&single=true&output=tsv',
        actionParameters: 		'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=1587413708&single=true&output=tsv',
        activityParameters: 	'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=1000197632&single=true&output=tsv',
        typologySchema: 		'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=47239118&single=true&output=tsv',
        inventorySchema: 		'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=695019938&single=true&output=tsv',
        siteData: 				'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=1010190784&single=true&output=tsv',
        content: 				'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=2082848666&single=true&output=tsv',
        contentAbout: 			'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=851266421&single=true&output=tsv',
        agencyConsumption: 		'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=487336511&single=true&output=tsv',
        greenPowerData: 		'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=616955311&single=true&output=tsv',
        agencyTargets: 			'https://docs.google.com/spreadsheets/d/e/2PACX-1vSeBcs4QqJvlTntRk1vS5kAnhGh9hjqr_T6bqR4JTEYIVITp6leQ6mZmtqdwWgE8jxRF1Q4Def1QIH4/pub?gid=477274966&single=true&output=tsv',
    }

////////////////////////////////////////////
/// DPIE NET ZERO DATA PREPARATION TOOL  ///
////////////////////////////////////////////

    d3.selectAll('#menuOption-grep, #menuOption-exportData, #menuOption-exportConfig').style('opacity', 0.5)

    Promise.all( 
        Object.values(gSheetTables).map(url => d3.tsv(url)))
    .then( loadedData => {
        Object.keys(gSheetTables).forEach( (tableName, i) => data[tableName] = loadedData[i] )
        addUploadHandler()

        console.log("Loaded data:", data)
        // Config.js now available
        d3.select('#menuOption-exportConfig').style('opacity', null)
        d3.select('#menuOption-exportConfig').attr('onclick', 'exportConfigFile()').style('opacity', 1)      
    });


///////////////////////////
/// GET DATA AND SCHEMA ///
///////////////////////////

    async function getSchema(data) {
        console.log('Getting all GSheet data')
        let obj = {}
        Object.entries(gSheetTables).forEach( async ([key, url]) => { obj[key] =  await d3.tsv(url)  })     
        return obj
    }


    function loadCASPER(){
        loadedDataType = 'casper'
        document.getElementById("hidden-file-upload").click();
    };

    function loadGREP(){
        loadedDataType = 'grep'
        document.getElementById("hidden-file-upload").click();                  
    };

    // Handler for hidden file selector 
    function addUploadHandler() {
        d3.select("#hidden-file-upload").on("change", function(){       // Opens file selection window  
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                console.log('Data loading... ')     

                const uploadFile = this.files[0],
                    filereader = new window.FileReader()
                filereader.readAsText(uploadFile)
            
                filereader.onload = async function(){
                    if(loadedDataType === 'casper'){
                        data.consumption = JSON.parse(tsvJSON(filereader.result))
                        await parseCasperData()
                        d3.select('#menuOption-casper')
                            .attr('onclick', null)
                            .style('opacity', 0.5)

                    } else if(loadedDataType === 'grep'){
                        data.grepProjects = JSON.parse(tsvJSON(filereader.result))
                        await parseGrepData()
                        d3.select('#menuOption-grep')
                            .attr('onclick', null)
                            .style('opacity', 0.5)                      
                    }
                }

            } else {
                alert("Your browser won't let you save this file -- try using Chrome, Firefox, Safari or Edge.");
            }
        });   
    }; 


////////////////////////////////////////
/// DATA PARSING AND OUTPUT CREATION ///
////////////////////////////////////////

    async function parseCasperData(){
        console.log('*** PARSING CASPER DATA ***')
        // 0. SET MODE
            const mode = document.getElementById('option-A').checked ? 'removeAll' : document.getElementById('option-B').checked  ? 'removeUnassigned' : 'processAll'
        // 1. EXTRACT SITE GROUP TYPOLOGY SCHEMA
            dataModel.schema.typologyMapping.modelSitetypeList   = [...new Set(data.typologySchema.map(d => d.siteType) )]

            dataModel.schema.typologyMapping.sitetypeBySitegroup = d3.nest()
                .key(d => d.siteGroup)
                .rollup(v => v.map(d => d.siteType) )               
                .entries(data.typologySchema.filter( d => d.siteGroup !== ''))

            dataModel.schema.typologyMapping.modelSitetypeList.forEach( sitetype => {
                let group 

                dataModel.schema.typologyMapping.sitetypeBySitegroup.forEach(obj => {
                    if(obj.value.indexOf(sitetype) > -1) { 
                        group = obj.key 
                    }
                })
                dataModel.schema.typologyMapping.modelSitetypeToSitegroup[sitetype] = group
            })

        // 2. EXTRACT AGENCIES WITH MANUALLY SET SITES
            const sitegroupsWithManuallySetSites = [...new Set(data.siteData.map(d => d.sitegroup))]
            sitegroupsWithManuallySetSites.forEach(sitegroup => {
                dataModel.sitegroupAgency[sitegroup] = []
                data.siteData.forEach( d => {
                    if(d.sitegroup === sitegroup){
                        dataModel.sitegroupAgency[sitegroup].push(d.agency)
                    }
                })              
            })

        // 3. PARSE SYSTEM EXTRACTED CONSUMPTION DATA
            // i. Parse all data rows  
                data.consumption = data.consumption.map( (d,i) => {     

                    const sitegroup = typeof dataModel.schema.typologyMapping.modelSitetypeToSitegroup[d['Site Type'].replace(/['"]+/g, '')] !== 'undefined' ? dataModel.schema.typologyMapping.modelSitetypeToSitegroup[d['Site Type'].replace(/['"]+/g, '')] : "Unassigned",
                        id = d['Site Id'] === "0" ? d['Agency name'].replace(/['"]+/g, '')+'_ALL' : d['Site Id']+'_'+d['Agency name'].replace(/['"]+/g, ''),
                        source = d["Dataset (source)"].toUpperCase().slice(0,9) === "OFF/WASTE" ? 
                            dataModel.schema.dataSets["OFF/WASTE"].type : 
                            dataModel.schema.dataSets[d["Dataset (source)"].toUpperCase()].type

                    let consumption, unit
                    switch(source){
                        case 'CI_WASTE': // Include 
                            consumption = (typeof dataModel.schema.unitConversion.tonnes[d.Units] !== 'undefined') ? d['Consumption'] * dataModel.schema.unitConversion.tonnes[d.Units]: 0
                            unit = 'tonnes'
                            break

                        case 'ELEC':
                            consumption =  +d.Consumption
                            unit = 'kWh'                        
                            break

                        case 'NG':
                            consumption = +d.Consumption
                            unit: 'MJ'
                            break

                        case 'LPG':
                            consumption =  +d.Consumption
                            unit: 'kL'
                            break

                        case 'WATER':
                            consumption =  +d.Consumption
                            unit: 'kL'
                            break
                    } 

                    return {
                        id:                 id,     
                        agency:             d['Agency name'].replace(/['"]+/g, ''), 
                        consumption:        consumption,
                        cost:               +d['Cost'],
                        unit:               unit,
                        source:             source ,
                        sitename:           d['Site Name'] === "Site ALL" ? d['Agency name'].replace(/['"]+/g, '')+' - All sites' : d['Site Name'].replace(/['"]+/g, '') ,
                        sitetype:           d['Site Name'] === "Site ALL" ? 'All sites' : d['Site Type'] === "" ? "Not identified" : d['Site Type'].replace(/['"]+/g, ''),
                        sitegroup:          sitegroup,
                        year:               +d["Dataset Year"].slice(0,4) +1,
                        cluster:            d["Cluster"].replace(/['"]+/g, ''),
                        postcode:           d['Postcode'],
                    }
                })

            // ii. Filter out any non-consumption records
                const sitegroupList =  dataModel.schema.typologyMapping.sitetypeBySitegroup.map(d => d.key)
                data.consumption = data.consumption.filter( d => d.consumption !== 0)

            // iii. Filter negative consumption as per user setting
                if(mode === 'removeAll'){
                    data.consumption = data.consumption.filter( d => d.consumption > 0)
                } 
                if(mode === 'removeUnassigned'){
                    data.consumption = data.consumption.filter( d => sitegroupList.indexOf(d.sitegroup) > -1 || (d.consumption > 0 && d.sitegroup === 'Unassigned')  )
                } 

            // iv. Get Meta-info
                dataModel.schema.consumption.fieldNames         = Object.keys(data.consumption[0])
                dataModel.schema.consumption.noRecords          = data.consumption.length
                dataModel.schema.consumption.agencyList         = [...new Set(data.consumption.map(d => d.agency) )].sort()
                dataModel.schema.consumption.clusterList        = [...new Set(data.consumption.map(d => d.cluster) )].sort()
                dataModel.schema.consumption.siteNameList       = [...new Set(data.consumption.map(d => d.sitename) )].sort() 
                dataModel.schema.consumption.siteTypeList       = [...new Set(data.consumption.map(d => d.sitegroup) )].sort()
                dataModel.consumption.nested = d3.nest()
                    .key( d => d.cluster)
                    .key( d => d.agency)
                    .key( d => d.sitegroup)
                    .key( d => d.id)
                    .key( d => d.source)
                    .rollup(v => {                      
                        return {
                            vol:                Math.round(d3.sum(v, d => d.consumption) * 1000) /1000,
                            cost:               Math.round(d3.sum(v, d => d.cost) *1000) /1000,
                        }
                    })  
                    .entries(data.consumption).sort((a,b) => (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0)); 

                dataModel.siteMeta = d3.nest()
                    .key( d => d.id)
                    .rollup(v => {                      
                        return {
                            names:          [...new Set(v.map(d => d.sitename) )],
                            pc:             v[0].postcode,
                            type:           v[0].sitetype,
                            ag:             v[0].agency
                        }
                    })  
                    .entries(data.consumption).sort((a,b) => (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0)); 

            // iv. Create consumption output data 
                dataOutput.consumption = dataModel.consumption.nested.map( d => {
                    return { [d.key]: d.values.map( d => { 
                        return { [d.key] : d.values.map( d => { 
                            return { [d.key] : d.values.map( d => { 
                                return { [d.key] : d.values.map( d => {
                                    return { [d.key] : d.value } 
                                }) }
                            }) }
                        }) }
                    }) } 
                }) 

            // iv. Create consumption site meta data 
                dataOutput.siteMeta = {} 
                dataModel.siteMeta.forEach( d => {
                    dataOutput.siteMeta[d.key] =  d.value  
                }) 

        // 5. EXTRACT AND SET THE BASELINE YEAR
            dataModel.schema.baselineYear = data.consumption[0].year    // Takes the year of the first record

        // 6. Enable GREP LOADING
            d3.selectAll('#menuOption-grep').attr('onclick', 'loadGREP()').style('opacity', 1)      

        alert('CASPER data sucessfully loaded and parsed')
    }; // end parseData


    async function parseGrepData(){
        console.log('*** PARSING GREP DATA ***')
        // 1. EXTRACT & ANALYSE GREP DATA INCL. estimated OF CURRENT SOLAR INSTALLATIONS
            // i. Extract schema
                dataOutput.grepMeta = {
                    projectTypes:   [...new Set(data.grepProjects.map(d => d["Project Type"]))].filter(d => d !=='' && d !== null),
                    years:          [...new Set(data.grepProjects.map(d => d["Financial Year"]) )]
                }

            // ii. Parse project data and add meta-data
                const clensedGREP = [], fieldNames = Object.keys(data.grepProjects[0])
                data.grepProjects.forEach(d => {
                    // Guard for 'tabs' in the comment fields" which upset the data structure) 
                    if(typeof d['Agency'] !== 'undefined' && dataModel.schema.consumption.agencyList.indexOf(d['Agency'].replace(/['"]+/g, '')) > -1 && !isNaN(+d.OrgId)){                  
                        const startOfFY = new Date(dataModel.schema.baselineYear - 1, 5, 31), 
                            endOfFY =  new Date(dataModel.schema.baselineYear , 5, 31),
                            completionDate = helpers.parseTimeB(d['Project Completion']),
                            siteType = typeof dataOutput.siteMeta[d['Site Id']] !== 'undefined' ? dataOutput.siteMeta[d['Site Id']].type : d['Site Type'] 

                        let obj = {
                            agency:         typeof dataOutput.siteMeta[d['Site Id']] !== 'undefined' ? dataOutput.siteMeta[d['Site Id']].names[0] : d['Agency'].replace(/['"]+/g, ''), 
                            sitetype:       siteType,               
                            siteId:         d['Site Id'],               
                            eleckWh:        +d['Electricity Consumption Saving kWh'],
                            gasMJ:          +d['Gas Consumption Saving MJ'],
                            year:           +d['Financial Year'].slice(0,4) + 1,
                            baseImpact :    completionDate < startOfFY ? 1 : completionDate< endOfFY ? (endOfFY - completionDate)/ (1000 * 60 * 60 * 24) / 365 : 0,
                            type:           d['Project Type']   
                        }
                        clensedGREP.push(obj)   
                    }
                    dataOutput.grep = clensedGREP
                })

        // 2. Enable EXPORT
            d3.select('#menuOption-exportData').attr('onclick', 'exportDataFile()').style('opacity', 1)      

        alert('GREP data sucessfully loaded and parsed')
    }; // end parseData


////////////////////////////////////////
/// EXPORT OF DATA.JS JSON FILE     ///
////////////////////////////////////////

    // Save file to external JSON text
    function exportDataFile(){
        let blob = new Blob([
                'let consumptionData = ',
                    window.JSON.stringify(dataOutput.consumption), 
                    ', siteMeta = ', 
                    window.JSON.stringify(dataOutput.siteMeta),
                    ', casperBaselineYear = ',
                    window.JSON.stringify(dataModel.schema.baselineYear),
                    ', grepData = ',
                    window.JSON.stringify(dataOutput.grep), 
                    ', grepMeta = ', 
                    window.JSON.stringify(dataOutput.grepMeta)
                    ], 
                    {type: "text/plain;charset=utf-8"})
        saveAs(blob, 'data.js');
        window.alert("The data file has been saved to your download");
    }; // end saveFile()

    function exportConfigFile(){
        console.log("export config???")
        let blob = new Blob([
                `let configData = {
                    actionParameters:   ${window.JSON.stringify(data.actionParameters)},
                    activityParameters: ${window.JSON.stringify(data.activityParameters)},
                    agencyConsumption:  ${window.JSON.stringify(data.agencyConsumption)},
                    agencyTargets:      ${window.JSON.stringify(data.agencyTargets)},
                    content:            ${window.JSON.stringify(data.content)},
                    contentAbout:       ${window.JSON.stringify(data.contentAbout)},
                    emissionParameters: ${window.JSON.stringify(data.emissionParameters)},
                    globalParameters:   ${window.JSON.stringify(data.globalParameters)},
                    greenPowerData:     ${window.JSON.stringify(data.greenPowerData)},
                    inventorySchema:    ${window.JSON.stringify(data.inventorySchema)},
                    siteData:           ${window.JSON.stringify(data.siteData)},
                    temporalParameters: ${window.JSON.stringify(data.temporalParameters)},
                    typologySchema:     ${window.JSON.stringify(data.typologySchema)}
                    }`], 
                    {type: "text/plain;charset=utf-8"})
        saveAs(blob, 'config.js');
        window.alert("The data file has been saved to your download");
    }; // end saveFile()


    // Helper to convert TSV to JSON
    function tsvJSON(tsv){
        const lines = tsv.split("\n"),
        result = [],
        headers =lines[0].split("\t")

        for(let i = 1; i< lines.length; i++){
            const obj = {};
            let currentline = lines[i].split("\t");
            for(var j = 0; j < headers.length; j++){
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        //return result; //JavaScript object
        return JSON.stringify(result); //JSON
    }