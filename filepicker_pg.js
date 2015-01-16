var filepicker = (function(){

    return {
        setKey: setKey,
        pick: pick,
        pickAndStore: pickAndStore
    };

    function pickAndStore(picker_options, store_options, callBackSuccess, callBackError) {
        checkApiKey();

        var multiple = !!(picker_options['multiple']);
        //copying over options so as to not mutate them
        var options = !!picker_options ? clone(picker_options) : {};

        options.storeLocation = store_options.location || 'S3';
        options.storePath = store_options.path;
        options.storeContainer = store_options.container;
        options.storeAccess = store_options.access || 'private';

        //If multiple, path must end in /
        if (multiple && options.storePath) {
            if (options.storePath.charAt(options.storePath.length - 1) != "/") {
                throw "pickAndStore with multiple files requires a path that ends in '/'";
            }
        }

        var url = constructPickUrl(options, multiple);
        normalizeOptions(options);
        openDialogWindow(url, callBackSuccess, callBackError);
    };

    function pick(options, callBackSuccess, callBackError) {
        checkApiKey();
        options = options || {};
        normalizeOptions(options);
        var url = constructPickUrl(options, null);
        openDialogWindow(url, callBackSuccess, callBackError);
    };


    function setKey(key) {
        window.filepicker.apikey = key;
    };


    function getId(){
        var d = new Date();
        return d.getTime().toString();
    };

    function checkApiKey(){
        if (!window.filepicker.apikey) {
            throw "Filepicker API Key not found";
        }
    };

    function clone (o) {
        var ret = {};
        for (key in o) {
            ret[key] = o[key];
        }
        return ret;
    };


    function constructPickUrl(options, multiple) {
        var url = "https://www.filepicker.io/dialog/open/";
        return url+
            "?key="+window.filepicker.apikey+
            "&id="+getId()+
            "&iframe="+false+
            "&version=v1"+
            (options['services'] ? "&s="+options['services'].join(",") : "")+
            // Force window container
            "&container=window"+
            // Currently not supporting multiple uploadings
            "&multi=false"+
            (options['mimetypes'] !== undefined ? "&m="+options['mimetypes'].join(",") : "")+
            (options['extensions'] !== undefined ? "&ext="+options['extensions'].join(",") : "")+
            (options['openTo'] !== undefined ? "&loc="+options['openTo'] : "")+
            (options['language'] ? "&language="+options['language'] : "")+
            (options['maxSize'] ? "&maxSize="+options['maxSize']: "")+
            (options['maxFiles'] ? "&maxFiles="+options['maxFiles']: "")+
            (options['signature'] ? "&signature="+options['signature'] : "")+
            (options['policy'] ? "&policy="+options['policy'] : "")+
            (options['folders'] !== undefined ? "&folders="+options['folders'] : "")+
            (options['storeLocation'] ? "&storeLocation="+options['storeLocation'] : "")+
            (options['storePath'] ? "&storePath="+options['storePath'] : "")+
            (options['storeContainer'] ? "&storeContainer="+options['storeContainer'] : "")+
            (options['storeAccess'] ? "&storeAccess="+options['storeAccess'] : "")+
            "&redirect_url=https://www.filepicker.io/dialog/phonegap_done/"+
            // Force mobile view
            "&mobile=true";
    };

    function openDialogWindow(url, callBackSuccess, callBackError) {
        var ref = window.open(encodeURI(url), "_blank", "location=no,fullscreen=no,toolbar=yes,titlebar=yes,scrollbars=yes,resizable=yes");

        var closeInAppBrowserAndGetFileInfo = function (event) {
            if (event.url.toString().indexOf('fpurl') > -1) {
                var fileUrl = event.url.toString().split('fpurl=')[1];
                
                if (fileUrl.indexOf('&id=') > -1) {
                    fileUrl = fileUrl.split('&id=')[0];
                }
                var originalFileUrl = String(fileUrl);
                fileUrl += '/metadata';

                jQuery.get(fileUrl, function (data) {
                    data.url = originalFileUrl;
                    callBackSuccess(data);
                }).error(function (error) {
                    callBackError(error);
                });
                ref.close();
            };
        };
        if (ref) {
            if (ref.addEventListener) {
                ref.addEventListener('loadstop', closeInAppBrowserAndGetFileInfo);
            }
            else {
                ref.attachEvent('loadstop', closeInAppBrowserAndGetFileInfo);
            }
        }
    };

    function normalizeOptions(options) {

        var normalize = function(singular, plural, def){
            if (options[plural]) {
                if (!isArray(options[plural])) {
                    options[plural] = [options[plural]];
                }
            } else if (options[singular]) {
                options[plural] = [options[singular]];
            } else if (def) {
                options[plural] = def;
            }
        };

        function setDefault(obj, key, def) {
            if (obj[key] === undefined) {
                obj[key] = def;
            }
        };

        function isArray(o) {
            return o && Object.prototype.toString.call(o) === '[object Array]';
        };

        var services = {
            COMPUTER: 1,
            DROPBOX: 2,
            FACEBOOK: 3,
            GITHUB: 4,
            GMAIL: 5,
            IMAGE_SEARCH: 6,
            URL: 7,
            WEBCAM: 8,
            GOOGLE_DRIVE: 9,
            SEND_EMAIL: 10,
            INSTAGRAM: 11,
            FLICKR: 12,
            VIDEO: 13,
            EVERNOTE: 14,
            PICASA: 15,
            WEBDAV: 16,
            FTP: 17,
            ALFRESCO: 18,
            BOX: 19,
            SKYDRIVE: 20,
            GDRIVE: 21,
            CUSTOMSOURCE: 22,
            CLOUDDRIVE: 23
        };

        normalize('service', 'services');
        normalize('mimetype', 'mimetypes');
        normalize('extension', 'extensions');

        if (options['services']) {
            for (var i = 0; i < options['services'].length; i++) {
                var service = (''+options['services'][i]).replace(" ","");

                if (services[service] !== undefined) {//we use 0, so can't use !
                    service = services[service];
                }

                options['services'][i] = service;
            }
        }

        if (options['mimetypes'] && options['extensions']) {
            throw "Error: Cannot pass in both mimetype and extension parameters to the pick function";
        }
        if (!options['mimetypes'] && !options['extensions']){
            options['mimetypes'] = ['*/*'];
        }

        if (options['openTo']) {
            options['openTo'] = services[options['openTo']] || options['openTo'];
        }

        setDefault(options, 'container', 'window');
    };
}());
