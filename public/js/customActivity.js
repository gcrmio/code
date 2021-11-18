define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "Create SMS Message", "key": "step1" }
    ];
    var currentStep = steps[0].key;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', save);
    //connection.on('clickedBack', onClickedBack);
    //connection.on('gotoStep', onGotoStep);

    // event: pick a row from data extension
    let DEID="";
    var eventDefinitionKey;
    connection.trigger('requestTriggerEventDefinition');

    connection.on('requestedTriggerEventDefinition',
    function(eventDefinitionModel) {
        if(eventDefinitionModel){

            eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
            console.log("[] Event Definition Key: " + eventDefinitionKey);
            /*If you want to see all*/
            console.log('[] Request Trigger',JSON.stringify(eventDefinitionModel));
            DEID = eventDefinitionModel.dataExtensionId;
            console.log("DEID in= "+DEID);
        }

    });

    console.log("DEID= "+DEID);



    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
    }

  function initialize(data) {
    console.log("Initializing START -------------------------------------------------------------");
        console.log("Initializing data data: "+ JSON.stringify(data));
        if (data) {
            payload = data;
        }    

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
         );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        console.log('Has In arguments: '+JSON.stringify(inArguments));

        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                if (key === 'id_msg_id')            { $('#id_msg_id'            ).html(val); }
                if (key === 'id_display_subject')   { 
                    $('#id_display_subject'   ).val(val);  
                    if(val.length>0) $('#id_btn_display_S').click();
                }
                if (key === 'id_display_body')      { 
                    $('#id_display_body'      ).val(val);  
                    if(val.length>0) $('#id_btn_display_B').click();
                }

                if (key === 'id_display_cts')          { $('#id_display_cts' ).html(val); }
                if (key === 'id_display_ctsr')         { $('#id_display_ctsr').html(val); }

                if (key === 'id_display_ctsr_srctype') { $('#id_display_ctsr_srctype' ).html(val); }
                if (key === 'id_display_ctsr_size')    { $('#id_display_ctsr_size'    ).html(val); }
                if (key === 'id_display_ctsr_width')   { $('#id_display_ctsr_width'   ).html(val); }
                if (key === 'id_display_ctsr_height')  { $('#id_display_ctsr_height'  ).html(val); }

                if (key === 'id_reg_date')          { $('#id_reg_date'          ).val(val);  }
                if (key === 'id_reg_time')          { $('#id_reg_time'          ).val(val);  }
                if (key === 'id_msg_desc')          { $('#id_msg_desc'          ).val(val);  }
                if (key === 'id_msg_admin')         { $('#id_msg_admin'         ).val(val);  }
                if (key === 'id_msg_charge')        { $('#id_msg_charge'        ).val(val);  }
                if (key === 'id_send_date')         { $('#id_send_date'         ).val(val);  }
                if (key === 'id_send_time')         { $('#id_send_time'         ).val(val);  }
                if (key === 'id_check_coupon')      { $('#id_check_coupon'      ).prop('checked', val);  }
                if (key === 'id_check_individual')  { $('#id_check_individual'  ).prop('checked', val);  }
                if (key === 'id_load_content')      { $('#id_load_content'      ).html(val); }
                if (key === 'id_load_content_type') { $('#id_load_content_type' ).html(val); }
                if (key === 'id_msg_type')          { $('#id_msg_type'          ).html(val); }

                if (key === 'id_size_total')        { $('#id_size_total'        ).html(val); }
                if (key === 'id_size_subject')      { $('#id_size_subject'      ).html(val); }
                if (key === 'id_size_body')         { $('#id_size_body'         ).html(val); }
                if (key === 'id_size_content')      { $('#id_size_content'      ).html(val); }
                if (key === 'id_cost_total')        { $('#id_cost_total'        ).html(val); }
                if (key === 'id_cost_unitprice')    { $('#id_cost_unitprice'    ).html(val); }
                if (key === 'id_cost_units')        { $('#id_cost_units'        ).html(val); }
                if (key === 'id_cost_credit')       { $('#id_cost_credit'       ).html(val); }

            })
        });


        $('#id_btn_register').click();

        if( $('#id_display_ctsr_srctype' ).html()=='MC-I' ) $('#id_btn_display_MC').click();
        if( $('#id_display_ctsr_srctype' ).html()=='MC-B' ) $('#id_btn_display_MC').click();
        if( $('#id_display_ctsr_srctype' ).html()=='LC-I' ) $('#id_btn_display_LC').click();

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });

        console.log("Initializing END -------------------------------------------------------------");
    }

    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
        console.log("Tokens function: "+JSON.stringify(tokens));
        //authTokens = tokens;
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        console.log("Get End Points function: "+JSON.stringify(endpoints));
    }

    function save() {

        console.log("function save in customActivity called");
/*
        var id_msgid         = $('#id_msgid').html();
        var id_msg_desc      = $('#id_msg_desc').val();
        var id_msg_admin     = $('#id_msg_admin').val();
        var id_msg_charge    = $('#id_msg_charge').val();
        var id_reg_date      = $('#id_reg_date').val();
        var id_reg_time      = $('#id_reg_time').val();
        var id_send_date     = $('#id_send_date').val();
        var id_send_time     = $('#id_send_time').val();
        var id_loadedContent = $('#id_loadedContent').html();
        //var body = $('#messageBody').val();

        payload['arguments'].execute.inArguments = [{

            "id_msgid":         id_msgid,
            "id_msg_desc":      id_msg_desc,
            "id_msg_admin":     id_msg_admin,
            "id_msg_charge":    id_msg_charge,
            "id_reg_date":      id_reg_date,
            "id_reg_time":      id_reg_time,
            "id_send_date":     id_send_date,
            "id_send_time":     id_send_time,
            "id_loadedContent": id_loadedContent,
            //"body": body,
            "name" : "{{Event."+eventDefinitionKey+".CSTMSEQ}}", 
            "phone": "{{Event."+eventDefinitionKey+".Mobile}}"
        }];

        payload['metaData'].isConfigured = true;

        console.log("Payload on SAVE function: "+JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
*/

        var id_msg_id               = $('#id_msg_id').html();
        var id_display_subject      = $('#id_display_subject').val();
        var id_display_body         = $('#id_display_body').val();
        var id_display_cts          = $('#id_display_cts').html();
        var id_display_ctsr         = $('#id_display_ctsr').html();
        var id_display_ctsr_srctype = $('#id_display_ctsr_srctype').html();
        var id_display_ctsr_size    = $('#id_display_ctsr_size').html();
        var id_display_ctsr_width   = $('#id_display_ctsr_width').html();
        var id_display_ctsr_height  = $('#id_display_ctsr_height').html();

        var id_reg_date             = $('#id_reg_date').val();
        var id_reg_time             = $('#id_reg_time').val();
        var id_msg_desc             = $('#id_msg_desc').val();
        var id_msg_admin            = $('#id_msg_admin').val();
        var id_msg_charge           = $('#id_msg_charge').val();
        var id_send_date            = $('#id_send_date').val();
        var id_send_time            = $('#id_send_time').val();
        var id_check_coupon         = $('#id_check_coupon').is(':checked');
        var id_check_individual     = $('#id_check_individual').is(':checked');
        var id_load_content         = $('#id_load_content').html();
        var id_load_content_type    = $('#id_load_content_type').html();

        var id_msg_type             = $('#id_msg_type').html();
        
        var id_size_total           = $('#id_size_total').html();
        var id_size_subject         = $('#id_size_subject').html();
        var id_size_body            = $('#id_size_body').html();
        var id_size_content         = $('#id_size_content').html();
        var id_cost_total           = $('#id_cost_total').html();
        var id_cost_unitprice       = $('#id_cost_unitprice').html();
        var id_cost_units           = $('#id_cost_units').html();
        var id_cost_credit          = $('#id_cost_credit').html();



        payload['arguments'].execute.inArguments = [{

            "id_msg_id":                id_msg_id,
            "id_display_subject":       id_display_subject,
            "id_display_body":          id_display_body,
            "id_display_cts":           id_display_cts,
            "id_display_ctsr":          id_display_ctsr,
            "id_display_ctsr_srctype":  id_display_ctsr_srctype,
            "id_display_ctsr_size":     id_display_ctsr_size,
            "id_display_ctsr_width":    id_display_ctsr_width,
            "id_display_ctsr_height":   id_display_ctsr_height,
            "id_reg_date":              id_reg_date,
            "id_reg_time":              id_reg_time,
            "id_msg_desc":              id_msg_desc,
            "id_msg_admin":             id_msg_admin,
            "id_msg_charge":            id_msg_charge,
            "id_send_date":             id_send_date,
            "id_send_time":             id_send_time,
            "id_check_coupon":          id_check_coupon,
            "id_check_individual":      id_check_individual,
            "id_load_content":          id_load_content,
            "id_load_content_type":     id_load_content_type,
            "de_id":                    DEID,

            "id_size_total":            id_size_total,
            "id_size_subject":          id_size_subject,
            "id_size_body":             id_size_body,
            "id_size_content":          id_size_content,
            "id_cost_total":            id_cost_total,
            "id_cost_unitprice":        id_cost_unitprice,
            "id_cost_units":            id_cost_units,
            "id_cost_credit":           id_cost_credit,
            "id_msg_type":              id_msg_type,

            "cust_id" :     "{{Event."+eventDefinitionKey+".cust_id}}", 
            "cust_id_code": "{{Event."+eventDefinitionKey+".cust_id_code}}",
            "cust_name" :   "{{Event."+eventDefinitionKey+".cust_name}}", 
            "phone_no":     "{{Event."+eventDefinitionKey+".phone_no}}",
            "coupon_id":    "{{Event."+eventDefinitionKey+".coupon_id}}"
        }];


        payload['metaData'].isConfigured = true;

        console.log("Payload on SAVE function: "+JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }    
   

    

});