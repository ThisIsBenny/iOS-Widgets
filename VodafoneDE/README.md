# Vodafone DE remaining data volume
![Vodafone Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewLight.jpeg)
![Vodafone Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewDark.jpeg)

This widget shows the remaining data volume for a Vodafone Germany contract or prepaid card. The information will be loaded via MeinVodafone API. For this purpose, an automatic login via the cell phone network is performed, therefore it is necessary that the WIFI is not active for the first usage.
After the first usage, the informations are cached and will be used in case of an active WIFI Connection. The cached information will be also used to prevent the API from a lot of request. The TTL (Time To Live) of the Cache can be setup at the beginning of the script (default is 60 min)

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/VodafoneDE.js)

## Custom Config
If the default config or the network login isn't working for you, you can use the setup assistant to adjust the config:
* Use Mein Vodafone Login with Username + Password instead of Network Login
* Select the Data you want to show in the Widget
* Disable functions like Dark Mode Support
* Switch from remaining data volume to used data volume

Run the script in the scriptable app to start the setup assistant

## Credits
* Sillium for the inspiration https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728
* Chaeimg for the Circle diagram (https://github.com/chaeimg/battCircle)
