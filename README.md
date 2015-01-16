# Filepicker.io library for Phonegap apps

## Requirements

- Cordova inappbrowser plugin
```
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git
```

- jQuery

## Using

```
	filepicker.pick(options, onSuccess, onError);
	filepicker.pickAndStore(options, storeOptions, onSuccess, onError);
```

## Example: 
```
<script type="text/javascript"
 src="filepicker_pg.min.js"></script>

 <script type="text/javascript">
 	filepicker.setKey("AwMr7Yc2nQX2zdOcs5Q1Az");

	filepicker.pickAndStore(
	  {
	    mimetype:"image/*"
	  },
	  {
	    location:"S3"
	  },
	  function(Blobs){
	    console.log(JSON.stringify(Blobs));
	  }
	);
</script>
```


All options and examples (https://developers.filepicker.io/docs/web/javascript_api/)

Currently library do not support multiple uploads.

