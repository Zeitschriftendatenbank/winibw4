var oldEpn = '';

function SendEPNToLBS()
{
	var request = new ActiveXObject('MSXML2.ServerXMLHTTP.6.0');
    var sIdLBS = application.getSIdLBS();        
    if (!sIdLBS) {
        application.messageBox('userSendEPNToLBS', application.getString('IDS_WINIBW_MUST_BE_STARTED_FROM_LBS'), 'error-icon');   
        return;
    }
    var epn = '000000000';
    var maxEpn = '000000000';
    var clip = application.activeWindow.variable('P3CLIP');
    if (!clip) {
        application.messageBox('userSendEPNToLBS', application.getString('IDS_THIS_FUNCTION_IS_ONLY_AVAILABLE_IN_FULL_PRESENTETATION'), 'error-icon');   
        return;
    }
    var rec = clip.split('\n');
    for (var i = 0; i < rec.length; i++) {
        if (rec[i].substr(0, 4) == '7800') {
            epn = rec[i].substr(5);
            // Compare epn and maxEpn as numbers, replacing check digit by a number if it is X.
            if (parseInt(epn.replace('X', '5')) > parseInt(maxEpn.replace('X', '5'))) maxEpn = epn;
        }
    }
    if (maxEpn == '000000000') {
        application.messageBox('userSendEPNToLBS', application.getString('IDS_NO_EPN_WAS_FOUND_IN_THIS_RECORD'), 'error-icon');
        return;
    }
    epn = maxEpn;
    if (oldEpn == epn) {
        if (!confirm(epn + ' ' + application.getString('IDS_THIS_EPN_WAS_SENT_DO_YOU_WANT_TO_SEND_IT_AGIAN'))) {
            return;
        }
    }
    var url = sIdLBS + '&EPN=' + epn;
    try {
        request.open('GET', url, false);  
        request.send('');
    } catch(e) {
        application.messageBox('userSendEPNToLBS', application.getString('IDS_CONNECTION_TO_LBS_FAILED') + ' ' + url + ', ' + e, 'error-icon');   
        return;
    }
    // Test code: show response.
    // alert(request.responseText);
    oldEpn = epn;
}
