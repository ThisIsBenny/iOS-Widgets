# Where did I park my car?

This widget allows you to save the location of your car, which will then displayed in the widget as a map. So you know exactly where you parked.
If you don't know the way to the car anymore, you can start the navigation to the car's location with one click and let Apple Maps or Google Maps navigate you.

[[Download]](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/car-location/car-location.js)

## Setup
For this widget is a free API-Key from mapquest.com required. Sign up on https://developer.mapquest.com to get your personal API-Key.
Add your API-Key to your Widget parameters and that's it.

![Car Location Widget setup](https://raw.githubusercontent.com/ThisIsBenny/iOS-Widgets/main/car-location/setup.jpeg)

 It is recommended to select the option "Run Script" in the widget settings under "When Interacting".
 This will display a larger map view of the small widget when you click on the widget.

### Use Google Maps instead of Apple Maps
By default Apple Maps is used for navigation. If you want to use Google Maps you need to write `;google` in the widget parameter behind the API key.

## Notice
Due to limitations in iOS 14, it is not possible to tap on individual elements in the small widget to perform a specific action.
For this reason, no icons are displayed in the small widget at the top right.
But if you have selected the option "Run Script" in the widget settings under "When Interacting", the widget opens in the scriptable app as a large widget with icons and you can tap on the desired icon to perform the desired action.
