# Vodafone DE remaining data volume
![Vodafone Widget Preview light](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewLight.jpeg)
![Vodafone Widget Preview dark](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/previewDark.jpeg)

This widget shows the remaining data volume for a Vodafone Germany contract or prepaid card. The information will be loaded via MeinVodafone API. For this purpose, an automatic login via the cell phone network is performed, therefore it is necessary that the WIFI is not active for the first usage.
After the first usage, the informations are cached and will be used in case of an active WIFI Connection. The cached information will be also used to prevent the API from a lot of request. The TTL (Time To Live) of the Cache can be setup at the beginning of the script (default is 60 min)

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/VodafoneDE/VodafoneDE.js)

## Options
### Use MeinVodafone Login
It is possible to set the MeinVodafone Credentails via widget parameter, which allows the widget to update itself even with active WIFI connection or to show data usage of a different mobile contract.
Add your Credentails in this format to your widget parameters: `username|password|mobile-number`. the mobile-number has to start with 49 instead of 0.

Example: `JohnSmith|TopSecretPassword!|491721234567`

_Remark:_ If your password contains a | character, you have to adapt the script and use a different divider.

## Roadmap
* Add Medium Widget Support to display GigaDepot usage

## Contributors
* [Necriso](https://github.com/Necriso)

## Credits
* Sillium for the inspiration https://gist.github.com/Sillium/f904fb89444bc8dde12cfc07b8fa8728
* Chaeimg for the Circle diagram (https://github.com/chaeimg/battCircle)
